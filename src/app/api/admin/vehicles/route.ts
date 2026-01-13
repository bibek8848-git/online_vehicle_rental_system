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
            SELECT v.*, u.name as provider_name, u.email as provider_email
            FROM vehicles v
            JOIN users u ON v.provider_id = u.id
            ORDER BY v.created_at DESC
        `);
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Vehicles fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch vehicles" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['ADMIN']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id, is_approved, rejection_reason, provider_id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
        }

        await pgPool.query(
            "UPDATE vehicles SET is_approved = $1, rejection_reason = $2 WHERE id = $3",
            [is_approved, rejection_reason || null, id]
        );

        // Add notification for provider
        const message = is_approved 
            ? "Your vehicle listing has been approved." 
            : `Your vehicle listing was rejected. Reason: ${rejection_reason}`;
        
        await pgPool.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
            [provider_id, message, 'SYSTEM']
        );

        return NextResponse.json({ success: true, message: `Vehicle ${is_approved ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        console.error("Vehicle update error:", error);
        return NextResponse.json({ success: false, message: "Failed to update vehicle status" }, { status: 500 });
    }
}
