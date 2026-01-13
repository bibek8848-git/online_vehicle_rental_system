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
            'SELECT * FROM vehicles WHERE provider_id = $1 ORDER BY created_at DESC',
            [user.id]
        );
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch vehicles' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { make, model, year, registration_number, price_per_day, description, images } = await req.json();

        if (!make || !model || !year || !registration_number || !price_per_day) {
            return NextResponse.json({ success: false, message: 'Missing required vehicle information' }, { status: 400 });
        }

        const result = await pgPool.query(
            `INSERT INTO vehicles (provider_id, make, model, year, registration_number, price_per_day, description, images, is_approved) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE) 
             RETURNING id`,
            [user.id, make, model, year, registration_number, price_per_day, description, images || []]
        );

        return NextResponse.json({ success: true, data: result.rows[0], message: 'Vehicle added successfully and pending approval' });
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ success: false, message: 'Registration number already exists' }, { status: 409 });
        }
        console.error('Error adding vehicle:', error);
        return NextResponse.json({ success: false, message: 'Failed to add vehicle' }, { status: 500 });
    }
}
