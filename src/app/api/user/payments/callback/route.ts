import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('q'); // 'su' for success, 'fu' for failure
    const oid = searchParams.get('oid'); // Order ID / Transaction ID
    const amt = searchParams.get('amt');
    const refId = searchParams.get('refId');

    try {
        if (status === 'su') {
            // Success logic
            // In a real eSewa integration, you would verify the payment with eSewa servers here using refId and amt.
            
            // Update payment status
            const paymentResult = await pgPool.query(`
                UPDATE payments 
                SET status = 'SUCCESS', transaction_id = COALESCE($1, transaction_id)
                WHERE transaction_id = $2 OR id::text = $2
                RETURNING booking_id, user_id
            `, [refId, oid]);

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
            // Failure logic
            return NextResponse.redirect(new URL('/dashboard/user/bookings?status=failed', req.url));
        }
    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.redirect(new URL('/dashboard/user/bookings?status=error', req.url));
    }
}
