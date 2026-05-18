import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    const providerId = auth.user.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30days';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let dateFilter = "";
    if (range === '7days') {
        dateFilter = "AND b.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (range === '30days') {
        dateFilter = "AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (range === '6months') {
        dateFilter = "AND b.created_at >= CURRENT_DATE - INTERVAL '6 months'";
    } else if (range === 'custom' && startDateParam && endDateParam) {
        dateFilter = `AND b.created_at >= '${startDateParam}' AND b.created_at <= '${endDateParam}'`;
    }

    try {
        // Basic Stats
        const statsQuery = pgPool.query(`
            SELECT 
                COUNT(DISTINCT v.id) as total_vehicles,
                COUNT(b.id) as total_bookings,
                COUNT(b.id) FILTER (WHERE b.status = 'APPROVED' AND b.end_date >= CURRENT_DATE) as active_rentals,
                COUNT(b.id) FILTER (WHERE b.status = 'COMPLETED') as completed_rentals,
                COUNT(b.id) FILTER (WHERE b.status = 'CANCELLED' OR b.status = 'REJECTED') as cancelled_bookings,
                COALESCE(SUM(b.total_price) FILTER (WHERE b.payment_status = 'PAID'), 0) as total_earnings,
                COALESCE(SUM(b.total_price) FILTER (WHERE b.payment_status = 'PAID' AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE)), 0) as monthly_earnings,
                AVG(r.rating) as average_rating
            FROM vehicles v
            LEFT JOIN bookings b ON v.id = b.vehicle_id ${dateFilter}
            LEFT JOIN reviews r ON v.id = r.vehicle_id
            WHERE v.provider_id = $1
        `, [providerId]);

        // Top Performing Vehicle
        const topVehicleQuery = pgPool.query(`
            SELECT v.make, v.model, COUNT(b.id) as booking_count, SUM(b.total_price) as revenue
            FROM vehicles v
            JOIN bookings b ON v.id = b.vehicle_id
            WHERE v.provider_id = $1 AND b.payment_status = 'PAID' ${dateFilter}
            GROUP BY v.id
            ORDER BY booking_count DESC, revenue DESC
            LIMIT 1
        `, [providerId]);

        // Monthly Bookings & Revenue (last 6 months)
        const monthlyDataQuery = pgPool.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', b.created_at), 'Mon YYYY') as month,
                COUNT(b.id) as bookings,
                COALESCE(SUM(b.total_price) FILTER (WHERE b.payment_status = 'PAID'), 0) as revenue
            FROM vehicles v
            JOIN bookings b ON v.id = b.vehicle_id
            WHERE v.provider_id = $1 AND b.created_at >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', b.created_at)
            ORDER BY DATE_TRUNC('month', b.created_at)
        `, [providerId]);

        // Vehicle Availability
        const availabilityQuery = pgPool.query(`
            SELECT 
                is_available,
                COUNT(*) as count
            FROM vehicles
            WHERE provider_id = $1
            GROUP BY is_available
        `, [providerId]);

        // Most Booked Vehicles
        const mostBookedQuery = pgPool.query(`
            SELECT v.make || ' ' || v.model as name, COUNT(b.id) as value
            FROM vehicles v
            JOIN bookings b ON v.id = b.vehicle_id
            WHERE v.provider_id = $1 ${dateFilter}
            GROUP BY v.id
            ORDER BY value DESC
            LIMIT 5
        `, [providerId]);

        const [stats, topVehicle, monthlyData, availability, mostBooked] = await Promise.all([
            statsQuery, topVehicleQuery, monthlyDataQuery, availabilityQuery, mostBookedQuery
        ]);

        return NextResponse.json({
            success: true,
            data: {
                summary: stats.rows[0],
                topVehicle: topVehicle.rows[0] || null,
                monthlyTrends: monthlyData.rows,
                availability: availability.rows,
                mostBooked: mostBooked.rows
            }
        });

    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch analytics" }, { status: 500 });
    }
}
