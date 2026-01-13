import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        const minPrice = searchParams.get('minPrice') || '0';
        const maxPrice = searchParams.get('maxPrice') || '9999999';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = `
            SELECT v.* 
            FROM vehicles v 
            WHERE v.is_approved = TRUE 
            AND v.is_available = TRUE
            AND (v.make ILIKE $1 OR v.model ILIKE $1 OR v.description ILIKE $1)
            AND v.price_per_day BETWEEN $2 AND $3
        `;
        const params: any[] = [`%${search}%`, minPrice, maxPrice];

        if (type) {
            query += ` AND v.make ILIKE $${params.length + 1}`;
            params.push(`%${type}%`);
        }

        // Availability filtering logic
        if (startDate && endDate) {
            query += `
                AND v.id NOT IN (
                    SELECT vehicle_id FROM bookings 
                    WHERE status IN ('PENDING', 'APPROVED')
                    AND NOT (end_date < $${params.length + 1} OR start_date > $${params.length + 2})
                )
            `;
            params.push(startDate, endDate);
        }

        const result = await pgPool.query(query, params);
        
        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Fetch vehicles error:', error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to fetch vehicles" 
        }, { status: 500 });
    }
}
