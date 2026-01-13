import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id: vehicleId } = await params;
        const result = await pgPool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Fetch vehicle error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch vehicle details" }, { status: 500 });
    }
}
