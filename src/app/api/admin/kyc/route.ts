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
            SELECT k.*, u.name as user_name, u.email as user_email, u.role as user_role
            FROM kyc_documents k
            JOIN users u ON k.user_id = u.id
            ORDER BY k.created_at DESC
        `);
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("KYC fetch error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch KYC documents" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    const roleAuth = authorizeRole(auth.user, ['ADMIN']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { id, status, rejection_reason, user_id } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, message: "ID and status are required" }, { status: 400 });
        }

        await pgPool.query('BEGIN');

        // Update KYC document status
        await pgPool.query(
            "UPDATE kyc_documents SET status = $1, rejection_reason = $2 WHERE id = $3",
            [status, rejection_reason || null, id]
        );

        // Update User's overall KYC status
        await pgPool.query(
            "UPDATE users SET kyc_status = $1, kyc_rejection_reason = $2 WHERE id = $3",
            [status, rejection_reason || null, user_id]
        );

        // Add notification
        const message = status === 'APPROVED' 
            ? "Your KYC documents have been approved." 
            : `Your KYC documents were rejected. Reason: ${rejection_reason}`;
        
        await pgPool.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
            [user_id, message, 'KYC']
        );

        await pgPool.query('COMMIT');

        return NextResponse.json({ success: true, message: `KYC ${status.toLowerCase()} successfully` });
    } catch (error) {
        await pgPool.query('ROLLBACK');
        console.error("KYC update error:", error);
        return NextResponse.json({ success: false, message: "Failed to update KYC status" }, { status: 500 });
    }
}
