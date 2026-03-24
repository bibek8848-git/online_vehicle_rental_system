import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const result = await pgPool.query(`
            SELECT 
                p.id, 
                p.amount, 
                p.transaction_id, 
                p.payment_method, 
                p.status, 
                p.created_at,
                v.make,
                v.model,
                b.start_date,
                b.end_date
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN vehicles v ON b.vehicle_id = v.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `, [auth.user.id]);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Fetch payments error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 });
    }
}
