import { NextRequest, NextResponse } from "next/server";
import { pgPool } from "@/lib/db";
import { getAuthenticatedUserOrResponse, authorizeRole } from "@/app/api/auth/authorization";
import { generateEsewaSignature } from "@/lib/esewa";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUserOrResponse(req);
    if ('errorResponse' in auth) return auth.errorResponse;
    const user = auth.user;

    const roleAuth = authorizeRole(user, ['USER']);
    if (!roleAuth.authorized) return roleAuth.errorResponse;

    try {
        const { bookingId, amount } = await req.json();

        if (!bookingId || !amount) {
            return NextResponse.json({ success: false, message: "Booking ID and amount are required" }, { status: 400 });
        }

        // Generate a unique transaction UUID for eSewa
        const transactionUuid = `ESEWA-${bookingId}-${Date.now()}`;
        const productCode = config.esewa.merchantCode;
        
        // Normalize the amount to a string without extra decimal places if they are zero
        // to ensure it matches eSewa's internal representation.
        const amountStr = Number(amount).toString();
        
        // Data to sign: total_amount,transaction_uuid,product_code
        // Note: For test, we use total_amount = amount. Tax and charges are 0 for simplicity.
        const signatureData = `total_amount=${amountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
        console.log("Signature Data:", signatureData);
        const signature = generateEsewaSignature(signatureData);
        console.log("Generated Signature:", signature);
        
        // Create a pending payment record
        await pgPool.query(`
            INSERT INTO payments (booking_id, user_id, amount, transaction_id, status)
            VALUES ($1, $2, $3, $4, 'PENDING')
        `, [bookingId, user.id, amount, transactionUuid]);

        return NextResponse.json({
            success: true,
            data: {
                amount: amountStr,
                tax_amount: "0",
                total_amount: amountStr,
                transaction_uuid: transactionUuid,
                product_code: productCode,
                product_service_charge: "0",
                product_delivery_charge: "0",
                success_url: config.esewa.successUrl,
                failure_url: config.esewa.failureUrl,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: signature,
                esewa_url: config.esewa.testUrl
            }
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json({ success: false, message: "Failed to initiate payment" }, { status: 500 });
    }
}
