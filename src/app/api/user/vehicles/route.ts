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
        const search = (searchParams.get('search') || '').trim();
        const type = searchParams.get('type') || '';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = `
            SELECT v.* 
            FROM vehicles v 
            WHERE v.is_approved = TRUE 
            AND v.is_available = TRUE
        `;
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (v.make ILIKE $${params.length} OR v.model ILIKE $${params.length} OR v.description ILIKE $${params.length})`;
        }

        if (minPrice && !isNaN(parseFloat(minPrice))) {
            params.push(parseFloat(minPrice));
            query += ` AND v.price_per_day >= $${params.length}`;
        }

        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            params.push(parseFloat(maxPrice));
            query += ` AND v.price_per_day <= $${params.length}`;
        }

        if (type) {
            params.push(`%${type}%`);
            query += ` AND v.type ILIKE $${params.length}`;
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
