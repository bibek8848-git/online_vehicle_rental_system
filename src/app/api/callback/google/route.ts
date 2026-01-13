import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { pgPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: config.google.clientId!,
                client_secret: config.google.clientSecret!,
                redirect_uri: config.google.redirectUri!,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            return NextResponse.json({ error: 'Failed to get access token', details: tokenData }, { status: 500 });
        }

        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userInfo = await userInfoRes.json();
        const { name, email, picture: avatar } = userInfo;

        // Check if user exists
        const existingUserRes = await pgPool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        let user = existingUserRes.rows[0];

        if (!user) {
            const insertRes = await pgPool.query(
                `INSERT INTO users (name, email, profile_picture) VALUES ($1, $2, $3) RETURNING *`,
                [name, email, avatar]
            );
            user = insertRes.rows[0];
        }

        // 🔐 Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            config.jwtKey.jwtKey as string, 
            { expiresIn: '1h' }
        );

        // 🔁 Redirect with token (via query param)
        const redirectUrl = new URL('/', req.url); // redirect to home
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('name', user.name);
        redirectUrl.searchParams.set('email', user.email);
        redirectUrl.searchParams.set('avatar', user.profile_picture || '');
        redirectUrl.searchParams.set('role', user.role);

        return NextResponse.redirect(redirectUrl);



    } catch (err) {
        console.error('Google OAuth Error:', err);
        return NextResponse.json({ error: 'Something went wrong during authentication' }, { status: 500 });
    }
}
