import {NextResponse} from 'next/server';
import {config} from '@/lib/config';

export async function GET() {
    const scope = encodeURIComponent('openid email profile');
    const redirectUri = config.google.redirectUri;

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${config.google.clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(url);
}
