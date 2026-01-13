import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";
import {config} from "@/lib/config";
import {pgPool, ensureTablesExist} from "@/lib/db";
import bcrypt from "bcrypt";

const JWT_SECRET = config.jwtKey.jwtKey as string;

export async function POST(req: NextRequest) {
    const {email, password} = await req.json();
    try {
        // Ensure tables exist and admin is seeded
        await ensureTablesExist();
        
        // Try to query the database for the user
        const result = await pgPool.query(
            'SELECT * FROM users WHERE email = $1 OR name = $1',
            [email]
        );

        // If user exists in database
        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (passwordMatch) {
                const token = jwt.sign(
                    {email: user.email, id: user.id, role: user.role},
                    JWT_SECRET,
                    {expiresIn: "1h"}
                );

                return NextResponse.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        kyc_status: user.kyc_status,
                        avatar: user.profile_picture,
                    }
                });
            }
        }

        // If neither database user nor dummy user matched
        return NextResponse.json({
            success: false,
            message: "Invalid credentials",
        }, {status: 401});
    } catch (error) {
        console.error('Database login error:', error);
        return NextResponse.json({
            success: false,
            message: "Authentication error",
        }, {status: 500});
    }
}
