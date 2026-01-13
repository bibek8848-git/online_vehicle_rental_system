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
            `SELECT b.*, v.make, v.model, v.registration_number, u.name as customer_name, u.email as customer_email
             FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             JOIN users u ON b.user_id = u.id
             WHERE v.provider_id = $1
             ORDER BY b.created_at DESC`,
            [user.id]
        );
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching provider bookings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { bookingId, status } = await req.json();

        if (!bookingId || !status) {
            return NextResponse.json({ success: false, message: 'Booking ID and status are required' }, { status: 400 });
        }

        // Check if booking belongs to a vehicle owned by this provider
        const checkResult = await pgPool.query(
            `SELECT b.* FROM bookings b
             JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.id = $1 AND v.provider_id = $2`,
            [bookingId, user.id]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // Update status
        await pgPool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2',
            [status, bookingId]
        );

        // Add notification for user
        const booking = checkResult.rows[0];
        await pgPool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [booking.user_id, `Your booking request has been ${status.toLowerCase()}.`, 'BOOKING']
        );

        return NextResponse.json({ success: true, message: `Booking ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error('Error updating booking status:', error);
        return NextResponse.json({ success: false, message: 'Failed to update booking status' }, { status: 500 });
    }
}
