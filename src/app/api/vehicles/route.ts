import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['PROVIDER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { make, model, year, registration_number, price_per_day, description, images } = await req.json();

        if (!make || !model || !year || !registration_number || !price_per_day) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const result = await pgPool.query(
            `INSERT INTO vehicles (provider_id, make, model, year, registration_number, price_per_day, description, images)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [auth.user.id, make, model, year, registration_number, price_per_day, description || null, images || []]
        );

        return NextResponse.json({
            success: true,
            message: "Vehicle added successfully. Waiting for admin approval.",
            data: result.rows[0]
        });
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ success: false, message: "Registration number already exists" }, { status: 409 });
        }
        console.error('Vehicle add error:', error);
        return NextResponse.json({ success: false, message: "Failed to add vehicle" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    const isApproved = searchParams.get('isApproved');

    try {
        let query = 'SELECT v.*, u.name as provider_name FROM vehicles v JOIN users u ON v.provider_id = u.id WHERE 1=1';
        const params: any[] = [];

        if (providerId) {
            params.push(providerId);
            query += ` AND provider_id = $${params.length}`;
        }

        if (isApproved !== null) {
            params.push(isApproved === 'true');
            query += ` AND is_approved = $${params.length}`;
        } else {
            // By default, only show approved vehicles for public/users
            // But if a provider is looking at their own, they might want all.
            // Let's keep it simple: if no filter, show only approved.
            if (!providerId) {
                query += ' AND is_approved = TRUE';
            }
        }

        query += ' ORDER BY created_at DESC';

        const result = await pgPool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Vehicle fetch error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch vehicles" }, { status: 500 });
    }
}
