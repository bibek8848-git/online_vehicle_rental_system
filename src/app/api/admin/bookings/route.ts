import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['ADMIN']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const result = await pgPool.query(`
            SELECT b.*, u.name as customer_name, u.email as customer_email, 
                   v.make, v.model, v.registration_number,
                   p.name as provider_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN vehicles v ON b.vehicle_id = v.id
            JOIN users p ON v.provider_id = p.id
            ORDER BY b.created_at DESC
        `);
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Bookings fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 });
    }
}
