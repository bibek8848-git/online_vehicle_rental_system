import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const { vehicle_id, start_date, end_date } = await req.json();

        if (!vehicle_id || !start_date || !end_date) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Check if user's KYC is approved
        const user = await pgPool.query('SELECT kyc_status FROM users WHERE id = $1', [auth.user.id]);
        if (user.rows[0].kyc_status !== 'APPROVED') {
            return NextResponse.json({ success: false, message: "Please complete your KYC verification first" }, { status: 403 });
        }

        // Get vehicle price
        const vehicle = await pgPool.query('SELECT price_per_day, provider_id FROM vehicles WHERE id = $1 AND is_approved = TRUE', [vehicle_id]);
        if (vehicle.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Vehicle not found or not approved" }, { status: 404 });
        }

        const pricePerDay = vehicle.rows[0].price_per_day;
        const providerId = vehicle.rows[0].provider_id;

        // Calculate total price
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const totalPrice = diffDays * pricePerDay;

        // Check for double booking
        const conflict = await pgPool.query(
            `SELECT * FROM bookings 
             WHERE vehicle_id = $1 
             AND status NOT IN ('REJECTED', 'CANCELLED')
             AND (
               (start_date <= $2 AND end_date >= $2) OR
               (start_date <= $3 AND end_date >= $3) OR
               (start_date >= $2 AND end_date <= $3)
             )`,
            [vehicle_id, start_date, end_date]
        );

        if (conflict.rows.length > 0) {
            return NextResponse.json({ success: false, message: "Vehicle is already booked for these dates" }, { status: 409 });
        }

        const result = await pgPool.query(
            `INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [auth.user.id, vehicle_id, start_date, end_date, totalPrice]
        );

        // Notify provider
        await pgPool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [providerId, `You have a new booking request for your vehicle.`, 'BOOKING']
        );

        return NextResponse.json({
            success: true,
            message: "Booking request sent successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        let query = `
            SELECT b.*, v.make, v.model, u.name as customer_name, u.email as customer_email
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (auth.user.role === 'USER') {
            params.push(auth.user.id);
            query += ` AND b.user_id = $${params.length}`;
        } else if (auth.user.role === 'PROVIDER') {
            params.push(auth.user.id);
            query += ` AND v.provider_id = $${params.length}`;
        } else if (auth.user.role !== 'ADMIN') {
             return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        query += ' ORDER BY b.created_at DESC';

        const result = await pgPool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Booking fetch error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const { booking_id, status } = await req.json();

        if (!booking_id || !status) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Verify that the provider owns the vehicle or is admin
        const booking = await pgPool.query(`
            SELECT b.*, v.provider_id, b.user_id 
            FROM bookings b 
            JOIN vehicles v ON b.vehicle_id = v.id 
            WHERE b.id = $1
        `, [booking_id]);

        if (booking.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
        }

        if (auth.user.role !== 'ADMIN' && booking.rows[0].provider_id !== auth.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const result = await pgPool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, booking_id]
        );

        // Notify user
        await pgPool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [booking.rows[0].user_id, `Your booking status has been updated to ${status}.`, 'BOOKING']
        );

        return NextResponse.json({
            success: true,
            message: `Booking ${status.toLowerCase()} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Booking update error:', error);
        return NextResponse.json({ success: false, message: "Failed to update booking" }, { status: 500 });
    }
}
