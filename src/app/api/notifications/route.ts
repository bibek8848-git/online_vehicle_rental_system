import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const result = await pgPool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [auth.user.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Notification fetch error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;

    try {
        const { notification_id } = await req.json();

        if (notification_id) {
            await pgPool.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
                [notification_id, auth.user.id]
            );
        } else {
            // Mark all as read
            await pgPool.query(
                'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
                [auth.user.id]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Notifications updated"
        });
    } catch (error) {
        console.error('Notification update error:', error);
        return NextResponse.json({ success: false, message: "Failed to update notifications" }, { status: 500 });
    }
}
