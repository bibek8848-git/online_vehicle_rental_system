import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, message: "Current and new password are required" }, { status: 400 });
        }

        // Fetch user from DB to get the hashed password
        const result = await pgPool.query(
            'SELECT password FROM users WHERE id = $1',
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const storedHashedPassword = result.rows[0].password;

        // If user doesn't have a password (e.g., Google OAuth user), they might need to set one
        // But for now, we follow standard procedure
        if (!storedHashedPassword) {
            // For OAuth users who haven't set a password yet, we might allow them to set one without currentPassword
            // But let's keep it simple and assume standard users for now
            // Actually, better handle it:
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await pgPool.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, user.id]
            );
            return NextResponse.json({ success: true, message: "Password set successfully" });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, storedHashedPassword);
        if (!passwordMatch) {
            return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 401 });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in DB
        await pgPool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, user.id]
        );

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 });
    }
}
