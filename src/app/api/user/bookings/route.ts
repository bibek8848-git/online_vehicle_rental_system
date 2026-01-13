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
        const { vehicleId, startDate, endDate, totalPrice } = await req.json();

        // 1. Basic validation
        if (!vehicleId || !startDate || !endDate || !totalPrice) {
            return NextResponse.json({ success: false, message: "Missing required booking details" }, { status: 400 });
        }

        // 2. Check for date conflicts (Double booking prevention)
        const conflictCheck = await pgPool.query(`
            SELECT * FROM bookings 
            WHERE vehicle_id = $1 
            AND status IN ('PENDING', 'APPROVED')
            AND NOT (end_date < $2 OR start_date > $3)
        `, [vehicleId, startDate, endDate]);

        if (conflictCheck.rows.length > 0) {
            return NextResponse.json({ success: false, message: "Vehicle is already booked for these dates" }, { status: 409 });
        }

        // 3. Create booking
        const result = await pgPool.query(`
            INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status)
            VALUES ($1, $2, $3, $4, $5, 'PENDING')
            RETURNING *
        `, [user.id, vehicleId, startDate, endDate, totalPrice]);

        const newBooking = result.rows[0];

        // 4. Create notification for Provider (owner of the vehicle)
        const vehicleInfo = await pgPool.query('SELECT provider_id, make, model FROM vehicles WHERE id = $1', [vehicleId]);
        const providerId = vehicleInfo.rows[0].provider_id;
        const vehicleName = `${vehicleInfo.rows[0].make} ${vehicleInfo.rows[0].model}`;

        await pgPool.query(`
            INSERT INTO notifications (user_id, message, type)
            VALUES ($1, $2, 'BOOKING')
        `, [providerId, `New booking request for your vehicle: ${vehicleName}`]);

        return NextResponse.json({
            success: true,
            message: "Booking created successfully",
            data: newBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return NextResponse.json({ success: false, message: "Failed to create booking" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const result = await pgPool.query(`
            SELECT b.*, v.make, v.model, v.registration_number, v.images
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [user.id]);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Fetch bookings error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 });
    }
}
