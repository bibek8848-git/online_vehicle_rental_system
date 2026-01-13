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
        const { documentType, documentUrl } = await req.json();

        if (!documentType || !documentUrl) {
            return NextResponse.json({ success: false, message: "Document type and URL are required" }, { status: 400 });
        }

        // Insert document
        await pgPool.query(`
            INSERT INTO kyc_documents (user_id, document_type, document_url, status)
            VALUES ($1, $2, $3, 'PENDING')
        `, [user.id, documentType, documentUrl]);

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
        const documents = await pgPool.query('SELECT * FROM kyc_documents WHERE user_id = $1', [user.id]);
        const userInfo = await pgPool.query('SELECT kyc_status, kyc_rejection_reason FROM users WHERE id = $1', [user.id]);

        return NextResponse.json({
            success: true,
            data: {
                status: userInfo.rows[0].kyc_status,
                rejection_reason: userInfo.rows[0].kyc_rejection_reason,
                documents: documents.rows
            }
        });
    } catch (error) {
        console.error('Fetch KYC error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch KYC details" }, { status: 500 });
    }
}
