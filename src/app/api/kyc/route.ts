import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const { document_type, document_url } = await req.json();

        if (!document_type || !document_url) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Check if KYC already exists and its status
        const existingKyc = await pgPool.query(
            'SELECT * FROM kyc_documents WHERE user_id = $1 AND document_type = $2',
            [auth.user.id, document_type]
        );

        if (existingKyc.rows.length > 0 && existingKyc.rows[0].status === 'APPROVED') {
            return NextResponse.json({ success: false, message: "KYC for this document type is already approved" }, { status: 400 });
        }

        let result;
        if (existingKyc.rows.length > 0) {
            // Update existing record
            result = await pgPool.query(
                'UPDATE kyc_documents SET document_url = $1, status = $2, rejection_reason = NULL, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [document_url, 'PENDING', existingKyc.rows[0].id]
            );
        } else {
            // Insert new record
            result = await pgPool.query(
                'INSERT INTO kyc_documents (user_id, document_type, document_url) VALUES ($1, $2, $3) RETURNING *',
                [auth.user.id, document_type, document_url]
            );
        }

        // Update user's overall KYC status to PENDING
        await pgPool.query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['PENDING', auth.user.id]);

        return NextResponse.json({
            success: true,
            message: "KYC document uploaded successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('KYC upload error:', error);
        return NextResponse.json({ success: false, message: "Failed to upload KYC document" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const result = await pgPool.query(
            'SELECT * FROM kyc_documents WHERE user_id = $1',
            [auth.user.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('KYC fetch error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch KYC documents" }, { status: 500 });
    }
}
