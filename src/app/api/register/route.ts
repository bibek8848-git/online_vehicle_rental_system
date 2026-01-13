import { NextRequest, NextResponse } from "next/server";
import { pgPool, ensureTablesExist } from "@/lib/db";
import jwt from "jsonwebtoken";
import { config } from "@/lib/config";
import bcrypt from "bcrypt";

const JWT_SECRET = config.jwtKey.jwtKey as string;

export async function POST(req: NextRequest) {
    try {
        // Create tables and seed admin if they don't exist
        await ensureTablesExist();
        
        const { email, password, name, role } = await req.json();
        
        // Validate input
        if (!email || !password) {
            return NextResponse.json({ 
                success: false, 
                message: "Email and password are required" 
            }, { status: 400 });
        }

        // Validate role
        const allowedRoles = ['USER', 'PROVIDER'];
        const userRole = role && allowedRoles.includes(role) ? role : 'USER';

        if (role === 'ADMIN') {
            return NextResponse.json({
                success: false,
                message: "Admin registration is not allowed"
            }, { status: 403 });
        }
        
        // Check if user already exists
        const existingUser = await pgPool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ 
                success: false, 
                message: "User with this email already exists" 
            }, { status: 409 });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const result = await pgPool.query(
            'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, hashedPassword, name || null, userRole]
        );
        
        const newUser = result.rows[0];
        
        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                kyc_status: newUser.kyc_status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to register user" 
        }, { status: 500 });
    }
}