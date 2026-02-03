import { NextResponse } from "next/server";
import { db } from "@/db"; // Use alias if configured, or relative path "../../db"
import { tickets, users } from "@/db/schema";
import { mintTicketOnChain } from "@/lib/blockchain";
import { eq } from "drizzle-orm";
import aj from "@/lib/arcjet";

// Mock implementation of ticket buying
export async function POST(request: Request) {
    try {
        // 1. Security Check: Arcjet
        const decision = await aj.protect(request, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
            } else if (decision.reason.isBot()) {
                return NextResponse.json({ error: "Bot Detected" }, { status: 403 });
            } else {
                return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
        }

        const body = await request.json();
        const { buyerId, eventId, price, sellerId } = body;

        if (!buyerId || !eventId || !price || !sellerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Get Buyer's Wallet Address
        const [buyer] = await db.select().from(users).where(eq(users.id, buyerId)).limit(1);
        // User schema might verify by walletAddress in some contexts, keeping id for DB consistency
        if (!buyer || !buyer.walletAddress) {
            return NextResponse.json({ error: "Buyer not found or missing wallet address" }, { status: 404 });
        }

        // 3. Create Ticket in Database
        const [newTicket] = await db.insert(tickets).values({
            eventId,
            sellerId, // In a real buy flow, this might be the event organizer or existing owner
            // For now, valid defaults:
            ticketHash: `hash-${Date.now()}`,
            encryptedData: "encrypted-content-placeholder",
            status: "SOLD", // Status as requested for sold ticket
            minPrice: price,
        }).returning();

        console.log(`💾 Ticket saved to DB: ID ${newTicket.id}`);

        // 4. Mint on Blockchain
        // We use the buyer's wallet address from the DB
        const blockchainResult = await mintTicketOnChain(buyer.walletAddress, price);

        return NextResponse.json({
            success: true,
            data: {
                databaseId: newTicket.id,
                txHash: blockchainResult.transactionHash
            }
        });

    } catch (error: any) {
        console.error("Buy API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
