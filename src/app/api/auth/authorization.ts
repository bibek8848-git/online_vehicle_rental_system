import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function isAuthorized(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { valid: false, message: "Missing or invalid token" };
    }

    const token = authHeader.split(" ")[1];
    const { valid, decoded } = verifyToken(token);

    if (!valid || !decoded || typeof decoded === "string" || !("id" in decoded)) {
        return { valid: false, message: "Invalid token payload" };
    }

    return { valid: true, user: decoded };
}

export function authorizeRole(user: any, allowedRoles: string[]) {
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            errorResponse: NextResponse.json({
                success: false,
                message: "Forbidden: You do not have the required role to access this resource"
            }, { status: 403 })
        };
    }
    return { authorized: true };
}


export async function getAuthenticatedUserOrResponse(req: NextRequest) {
    const auth = await isAuthorized(req);

    if (!auth.valid || !auth.user || typeof auth.user === "string" || !("id" in auth.user)) {
        return {
            errorResponse: NextResponse.json({ success: false, message: auth.message }, { status: 401 }),
        };
    }

    return { user: auth.user }; // safe to assume user.id exists
}
