import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { bookingId, amount } = await req.json();

        if (!bookingId || !amount) {
            return NextResponse.json({ success: false, message: "Booking ID and amount are required" }, { status: 400 });
        }

        // In a real eSewa integration, you would generate a signature and form data here.
        // For this task, we will simulate the initiation and return the necessary parameters.
        
        const transactionId = `ESEWA-${Date.now()}`;
        
        // Create a pending payment record
        await pgPool.query(`
            INSERT INTO payments (booking_id, user_id, amount, transaction_id, status)
            VALUES ($1, $2, $3, $4, 'PENDING')
        `, [bookingId, user.id, amount, transactionId]);

        return NextResponse.json({
            success: true,
            data: {
                transactionId,
                amount,
                productCode: "EPAYTEST", // eSewa test merchant code
                successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/user/payments/callback?q=su`,
                failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/user/payments/callback?q=fu`,
            }
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json({ success: false, message: "Failed to initiate payment" }, { status: 500 });
    }
}
