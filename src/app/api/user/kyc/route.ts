import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const formData = await req.formData();
        const documentType = formData.get('documentType') as string;
        const file = formData.get('file') as File;

        if (!documentType || !file) {
            return NextResponse.json({ success: false, message: "Document type and file are required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Insert document
        await pgPool.query(`
            INSERT INTO kyc_documents (user_id, document_type, document_data, status)
            VALUES ($1, $2, $3, 'PENDING')
        `, [user.id, documentType, buffer]);

        // Update user KYC status to PENDING if it wasn't already
        await pgPool.query(`
            UPDATE users SET kyc_status = 'PENDING' WHERE id = $1 AND kyc_status != 'APPROVED'
        `, [user.id]);

        return NextResponse.json({
            success: true,
            message: "KYC document uploaded successfully"
        });
    } catch (error) {
        console.error('KYC upload error:', error);
        return NextResponse.json({ success: false, message: "Failed to upload KYC document" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const documents = await pgPool.query('SELECT id, user_id, document_type, document_url, document_data, status, rejection_reason, created_at FROM kyc_documents WHERE user_id = $1', [user.id]);
        const userInfo = await pgPool.query('SELECT kyc_status, kyc_rejection_reason FROM users WHERE id = $1', [user.id]);

        const processedDocuments = documents.rows.map(doc => {
            if (doc.document_data) {
                const base64 = doc.document_data.toString('base64');
                // We don't know the exact mime type easily without storing it, 
                // but we can default to image/jpeg or try to detect from common ones.
                // For simplicity, let's use image/jpeg as a default or assume the user uploads images.
                return {
                    ...doc,
                    document_url: `data:image/jpeg;base64,${base64}`,
                    document_data: undefined // Don't send the buffer again
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
