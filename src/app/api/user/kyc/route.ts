import { NextRequest, NextResponse } from "next/server";
import { pgPool, ensureTablesExist } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";
import { extractDataFromImage, verifyKYCData } from '@/lib/ocr';

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER', 'PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        // Ensure tables exist and schema is up to date
        await ensureTablesExist();

        const formData = await req.formData();
        const documentType = formData.get('documentType') as string;
        const file = formData.get('file') as File;

        if (!documentType || !file) {
            return NextResponse.json({ success: false, message: "Document type and file are required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Perform OCR
        let extractedData = null;
        let verificationResult: { verified: boolean; reason: string } = { verified: false, reason: "OCR failed to extract data" };
        
        try {
            extractedData = await extractDataFromImage(buffer);
            const result = verifyKYCData(user as any, extractedData);
            verificationResult = {
                verified: result.verified,
                reason: result.reason || "Verification failed"
            };
        } catch (ocrError) {
            console.error('OCR Error:', ocrError);
        }

        const status = verificationResult.verified ? 'APPROVED' : 'PENDING';
        const rejectionReason = verificationResult.verified ? null : verificationResult.reason;

        // Insert document
        await pgPool.query(`
            INSERT INTO kyc_documents 
            (user_id, document_type, document_data, status, extracted_name, extracted_id_number, extracted_dob, extracted_address, extracted_expiry_date, ocr_data, rejection_reason) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
            user.id, 
            documentType, 
            buffer, 
            status,
            extractedData?.name || null,
            extractedData?.idNumber || null,
            extractedData?.dob || null,
            extractedData?.address || null,
            extractedData?.expiryDate || null,
            JSON.stringify(extractedData) || null,
            rejectionReason
        ]);

        // Update user KYC status
        if (status === 'APPROVED') {
            await pgPool.query(
                "UPDATE users SET kyc_status = 'APPROVED', kyc_rejection_reason = NULL WHERE id = $1",
                [user.id]
            );
        } else {
            await pgPool.query(
                "UPDATE users SET kyc_status = 'PENDING' WHERE id = $1 AND (kyc_status IS NULL OR kyc_status = 'REJECTED')",
                [user.id]
            );
        }

        return NextResponse.json({
            success: true,
            message: status === 'APPROVED' ? 'KYC automatically verified!' : 'KYC uploaded and pending manual review.',
            autoVerified: status === 'APPROVED'
        });
    } catch (error) {
        console.error('KYC upload error:', error);
        return NextResponse.json({ success: false, message: "Failed to upload KYC document" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER', 'PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const documents = await pgPool.query('SELECT id, user_id, document_type, document_url, document_data, extracted_name, extracted_id_number, status, rejection_reason, created_at FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
        const userInfo = await pgPool.query('SELECT kyc_status, kyc_rejection_reason FROM users WHERE id = $1', [user.id]);

        const processedDocuments = documents.rows.map(doc => {
            if (doc.document_data) {
                const base64 = doc.document_data.toString('base64');
                return {
                    ...doc,
                    document_url: `data:image/jpeg;base64,${base64}`,
                    document_data: undefined
                };
            }
            return doc;
        });

        return NextResponse.json({
            success: true,
            data: {
                status: userInfo.rows[0].kyc_status,
                rejection_reason: userInfo.rows[0].kyc_rejection_reason,
                documents: processedDocuments
            }
        });
    } catch (error) {
        console.error('Fetch KYC error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch KYC details" }, { status: 500 });
    }
}
