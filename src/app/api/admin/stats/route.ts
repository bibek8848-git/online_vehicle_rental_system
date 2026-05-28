import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['ADMIN']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const totalUsers = await pgPool.query("SELECT COUNT(*) FROM users WHERE role = 'USER'");
        const totalProviders = await pgPool.query("SELECT COUNT(*) FROM users WHERE role = 'PROVIDER'");
        const totalBookings = await pgPool.query("SELECT COUNT(*) FROM bookings");
        const totalRevenue = await pgPool.query("SELECT SUM(amount) FROM payments WHERE status = 'SUCCESS'");
        const pendingKyc = await pgPool.query("SELECT COUNT(*) FROM users WHERE kyc_status = 'PENDING' AND role != 'ADMIN'");
        const pendingVehicles = await pgPool.query("SELECT COUNT(*) FROM vehicles WHERE is_approved = FALSE");
        const activeBookingsLast24h = await pgPool.query("SELECT COUNT(*) FROM bookings WHERE created_at >= NOW() - INTERVAL '24 HOURS'");
        const successfulPaymentsLast24h = await pgPool.query("SELECT COUNT(*) FROM payments WHERE status = 'SUCCESS' AND created_at >= NOW() - INTERVAL '24 HOURS'");
        const dbStatusCheck = await pgPool.query("SELECT 1");

        const uptimeSeconds = Math.floor(process.uptime());
        const uptimeHours = Math.floor(uptimeSeconds / 3600);
        const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeText = `${uptimeHours}h ${uptimeMinutes}m`;

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: parseInt(totalUsers.rows[0].count),
                totalProviders: parseInt(totalProviders.rows[0].count),
                totalBookings: parseInt(totalBookings.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
                pendingKyc: parseInt(pendingKyc.rows[0].count),
                pendingVehicles: parseInt(pendingVehicles.rows[0].count),
                platformHealth: {
                    uptimeSeconds,
                    uptimeText,
                    activeBookingsLast24h: parseInt(activeBookingsLast24h.rows[0].count),
                    successfulPaymentsLast24h: parseInt(successfulPaymentsLast24h.rows[0].count),
                    dbStatus: (dbStatusCheck?.rowCount ?? 0) > 0 ? 'Online' : 'Offline',
                }
            }
        });
    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch stats" }, { status: 500 });
    }
}
