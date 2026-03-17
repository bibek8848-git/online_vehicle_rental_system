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
            'SELECT id, user_id, document_type, document_url, document_data, status, rejection_reason, created_at FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC',
            [user.id]
        );

        const processedDocs = result.rows.map(doc => {
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

        return NextResponse.json({ success: true, data: processedDocs });
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
        const formData = await req.formData();
        const documentType = formData.get('documentType') as string;
        const file = formData.get('file') as File;

        if (!documentType || !file) {
            return NextResponse.json({ success: false, message: 'Document type and file are required' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Insert document
        await pgPool.query(
            'INSERT INTO kyc_documents (user_id, document_type, document_data, status) VALUES ($1, $2, $3, $4)',
            [user.id, documentType, buffer, 'PENDING']
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
