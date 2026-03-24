import crypto from 'crypto';
import { config } from './config';

export function generateEsewaSignature(data: string): string {
    const hash = crypto.createHmac('sha256', config.esewa.secretKey)
        .update(data)
        .digest('base64');
    return hash;
}
