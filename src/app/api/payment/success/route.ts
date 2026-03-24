import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const encodedResponse = searchParams.get('data');

    if (!encodedResponse) {
        return NextResponse.redirect(new URL('/dashboard/user/bookings?status=failed', req.url));
    }

    try {
        // Decode base64 response from eSewa
        const decodedData = JSON.parse(Buffer.from(encodedResponse, 'base64').toString('utf-8'));
        
        if (decodedData.status === 'COMPLETE') {
            const { transaction_uuid, total_amount, transaction_code } = decodedData;
            
            // Update payment status
            const paymentResult = await pgPool.query(`
                UPDATE payments 
                SET status = 'SUCCESS', transaction_id = $1
                WHERE transaction_id = $2
                RETURNING booking_id, user_id
            `, [transaction_code, transaction_uuid]);

            if (paymentResult.rows.length > 0) {
                const { booking_id, user_id } = paymentResult.rows[0];
                
                // Update booking status
                await pgPool.query(`
                    UPDATE bookings SET payment_status = 'PAID' WHERE id = $1
                `, [booking_id]);

                // Create notification for user
                await pgPool.query(`
                    INSERT INTO notifications (user_id, message, type)
                    VALUES ($1, $2, 'PAYMENT')
                `, [user_id, "Payment successful! Your booking is now confirmed."]);
            }

            return NextResponse.redirect(new URL('/dashboard/user/bookings?status=success', req.url));
        } else {
            return NextResponse.redirect(new URL('/dashboard/user/bookings?status=failed', req.url));
        }
    } catch (error) {
        console.error('Payment success callback error:', error);
        return NextResponse.redirect(new URL('/dashboard/user/bookings?status=error', req.url));
    }
}
