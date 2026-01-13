import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@/lib/db';
import { getAuthenticatedUserOrResponse, authorizeRole } from '@/app/api/auth/authorization';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id } = await params;
        const result = await pgPool.query(
            'SELECT * FROM vehicles WHERE id = $1 AND provider_id = $2',
            [id, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch vehicle' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id } = await params;
        const { make, model, year, registration_number, price_per_day, description, images, is_available } = await req.json();

        // Check if vehicle belongs to provider
        const checkResult = await pgPool.query(
            'SELECT * FROM vehicles WHERE id = $1 AND provider_id = $2',
            [id, user.id]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
        }

        await pgPool.query(
            `UPDATE vehicles 
             SET make = $1, model = $2, year = $3, registration_number = $4, 
                 price_per_day = $5, description = $6, images = $7, is_available = $8,
                 is_approved = FALSE -- Reset approval status on edit
             WHERE id = $9`,
            [make, model, year, registration_number, price_per_day, description, images || [], is_available, id]
        );

        return NextResponse.json({ success: true, message: 'Vehicle updated successfully and pending re-approval' });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        return NextResponse.json({ success: false, message: 'Failed to update vehicle' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id } = await params;
        const result = await pgPool.query(
            'DELETE FROM vehicles WHERE id = $1 AND provider_id = $2',
            [id, user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete vehicle' }, { status: 500 });
    }
}
