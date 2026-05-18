import { NextRequest, NextResponse } from "next/server";
import { pgPool, ensureTablesExist } from "@/lib/db";
import { config } from "@/lib/config";
import jwt from "jsonwebtoken";

const OPENAI_API_KEY = config.openai.apiKey;
const JWT_SECRET = config.jwtKey.jwtKey as string;

// Rule-based responses
const RESPONSES: Record<string, string> = {
    booking: "To book a vehicle, browse our fleet, select your desired vehicle, choose your dates, and click 'Book Now'. You'll need a verified account to complete the process.",
    payment: "We currently support payments via eSewa. Once your booking is approved, you'll see a 'Pay Now' option in your dashboard.",
    kyc: "KYC verification requires a clear photo of your Nepali Citizenship card or Driver's License. Our team typically reviews documents within 24 hours.",
    account: "You can manage your profile, view bookings, and check KYC status from your User Dashboard. For password resets, please contact support.",
    availability: "Vehicle availability is shown in real-time on our listing page. If a vehicle is 'Available', you can book it immediately for your chosen dates.",
    fallback: "I'm here to help with bookings, payments, KYC, and vehicle availability. Could you please provide more details or ask about one of these topics? You can also contact support@securedrives.com."
};

function getLocalResponse(message: string): { response: string, intent: string } {
    const msg = message.toLowerCase();
    
    if (msg.includes('book') || msg.includes('rent') || msg.includes('reservation')) {
        return { response: RESPONSES.booking, intent: 'BOOKING_HELP' };
    }
    if (msg.includes('pay') || msg.includes('esewa') || msg.includes('price') || msg.includes('cost')) {
        return { response: RESPONSES.payment, intent: 'PAYMENT_SUPPORT' };
    }
    if (msg.includes('kyc') || msg.includes('verify') || msg.includes('citizenship') || msg.includes('license') || msg.includes('document')) {
        return { response: RESPONSES.kyc, intent: 'KYC_GUIDANCE' };
    }
    if (msg.includes('account') || msg.includes('profile') || msg.includes('login') || msg.includes('password')) {
        return { response: RESPONSES.account, intent: 'ACCOUNT_ISSUE' };
    }
    if (msg.includes('available') || msg.includes('stock') || msg.includes('find') || msg.includes('search')) {
        return { response: RESPONSES.availability, intent: 'VEHICLE_QUERY' };
    }
    
    return { response: RESPONSES.fallback, intent: 'GENERAL' };
}

export async function POST(req: NextRequest) {
    try {
        await ensureTablesExist();
        const body = await req.json();
        const { message, sessionId } = body;
        
        console.log("Chat API Request (Local Mode):", { sessionId, messageLength: message?.length });

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // Get local rule-based response
        const { response: localResponse, intent } = getLocalResponse(message);

        // Optional: Get user from token if available
        let userId = null;
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (e) {
                // Ignore invalid token, proceed as guest
            }
        }

        // Store user message
        await pgPool.query(
            "INSERT INTO chat_messages (session_id, user_id, role, content, intent) VALUES ($1, $2, $3, $4, $5)",
            [sessionId, userId, "user", message, intent]
        );

        // Store assistant message
        await pgPool.query(
            "INSERT INTO chat_messages (session_id, user_id, role, content, intent) VALUES ($1, $2, $3, $4, $5)",
            [sessionId, userId, "assistant", localResponse, intent]
        );

        return NextResponse.json({ response: localResponse, intent });

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
        await ensureTablesExist();
        const result = await pgPool.query(
            "SELECT role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
            [sessionId]
        );
        return NextResponse.json({ messages: result.rows });
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
        await ensureTablesExist();
        await pgPool.query("DELETE FROM chat_messages WHERE session_id = $1", [sessionId]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to clear chat history:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
