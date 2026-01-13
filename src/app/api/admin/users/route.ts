import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['ADMIN']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const result = await pgPool.query(
            "SELECT id, name, email, role, kyc_status, created_at FROM users WHERE role = 'USER' ORDER BY created_at DESC"
        );
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Users fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
    }
}
