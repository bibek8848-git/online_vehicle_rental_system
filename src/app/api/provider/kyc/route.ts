import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/lib/db';
import { getAuthenticatedUserOrResponse, authorizeRole } from '@/app/api/auth/authorization';

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const result = await pgPool.query(
            'SELECT * FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC',
            [user.id]
        );
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching KYC:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch KYC documents' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { documentType, documentUrl } = await req.json();

        if (!documentType || !documentUrl) {
            return NextResponse.json({ success: false, message: 'Document type and URL are required' }, { status: 400 });
        }

        // Insert document
        await pgPool.query(
            'INSERT INTO kyc_documents (user_id, document_type, document_url, status) VALUES ($1, $2, $3, $4)',
            [user.id, documentType, documentUrl, 'PENDING']
        );

        // Update user KYC status to PENDING if it was REJECTED or null
        await pgPool.query(
            "UPDATE users SET kyc_status = 'PENDING' WHERE id = $1 AND (kyc_status IS NULL OR kyc_status = 'REJECTED')",
            [user.id]
        );

        return NextResponse.json({ success: true, message: 'KYC document uploaded successfully' });
    } catch (error) {
        console.error('Error uploading KYC:', error);
        return NextResponse.json({ success: false, message: 'Failed to upload KYC document' }, { status: 500 });
    }
}
