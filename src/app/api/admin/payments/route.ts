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
            SELECT p.*, u.name as user_name, u.email as user_email, b.status as booking_status
            FROM payments p
            JOIN users u ON p.user_id = u.id
            JOIN bookings b ON p.booking_id = b.id
            ORDER BY p.created_at DESC
        `);
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Payments fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 });
    }
}
