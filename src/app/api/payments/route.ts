import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const { booking_id, amount, transaction_id } = await req.json();

        if (!booking_id || !amount || !transaction_id) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Verify booking belongs to user
        const booking = await pgPool.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [booking_id, auth.user.id]);
        if (booking.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
        }

        // Create payment record
        await pgPool.query(
            `INSERT INTO payments (booking_id, user_id, amount, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [booking_id, auth.user.id, amount, transaction_id, 'SUCCESS']
        );

        // Update booking status
        await pgPool.query(
            "UPDATE bookings SET payment_status = 'PAID', status = 'APPROVED' WHERE id = $1",
            [booking_id]
        );

        // Notify user and provider
        const vehicle = await pgPool.query('SELECT provider_id FROM vehicles WHERE id = $1', [booking.rows[0].vehicle_id]);
        await pgPool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [auth.user.id, `Payment successful for your booking.`, 'PAYMENT']
        );
        await pgPool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [vehicle.rows[0].provider_id, `Payment received for a booking.`, 'PAYMENT']
        );

        return NextResponse.json({
            success: true,
            message: "Payment processed successfully"
        });
    } catch (error) {
        console.error('Payment error:', error);
        return NextResponse.json({ success: false, message: "Failed to process payment" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        let query = 'SELECT p.*, b.status as booking_status FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE 1=1';
        const params: any[] = [];

        if (auth.user.role === 'USER') {
            params.push(auth.user.id);
            query += ` AND p.user_id = $${params.length}`;
        } else if (auth.user.role === 'ADMIN') {
            // Admin can see all
        } else {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const result = await pgPool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Payment fetch error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 });
    }
}
