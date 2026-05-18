import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse } from "@/app/api/auth/authorization";

export async function GET(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    try {
        const result = await pgPool.query(
            'SELECT id, name, email, role, profile_picture, kyc_status, created_at FROM users WHERE id = $1',
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const userData = result.rows[0];
        return NextResponse.json({
            success: true,
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                avatar: userData.profile_picture,
                kyc_status: userData.kyc_status,
                created_at: userData.created_at
            }
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    try {
        const contentType = req.headers.get("content-type") || "";
        let name: string | null = null;
        let avatar: string | null | undefined = undefined;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = formData.get("name") as string;
            const file = formData.get("avatar") as File | null;

            if (file) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
                avatar = base64Image;
            }
        } else {
            const body = await req.json();
            name = body.name;
            avatar = body.avatar;
        }

        if (!name && avatar === undefined) {
            return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
        }

        let query = 'UPDATE users SET ';
        const values = [];
        let count = 1;

        if (name) {
            query += `name = $${count}, `;
            values.push(name);
            count++;
        }

        if (avatar !== undefined) {
            query += `profile_picture = $${count}, `;
            values.push(avatar);
            count++;
        }

        // Remove trailing comma and space
        query = query.slice(0, -2);
        query += ` WHERE id = $${count} RETURNING id, name, email, role, profile_picture as avatar, kyc_status`;
        values.push(user.id);

        const result = await pgPool.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
    }
}
