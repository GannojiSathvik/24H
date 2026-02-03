import { NextResponse } from "next/server";
import { db } from "@/db"; // Use alias if configured, or relative path "../../db"
import { tickets, users } from "@/db/schema";
import { mintTicketOnChain } from "@/lib/blockchain";
import { eq } from "drizzle-orm";

// Mock implementation of ticket buying
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { buyerId, eventId, price, sellerId } = body;

        if (!buyerId || !eventId || !price || !sellerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get Buyer's Wallet Address
        const [buyer] = await db.select().from(users).where(eq(users.id, buyerId)).limit(1);
        if (!buyer || !buyer.walletAddress) {
            return NextResponse.json({ error: "Buyer not found or missing wallet address" }, { status: 404 });
        }

        // 2. Create Ticket in Database
        const [newTicket] = await db.insert(tickets).values({
            eventId,
            sellerId, // In a real buy flow, this might be the event organizer or existing owner
            // For now, valid defaults:
            ticketHash: `hash-${Date.now()}`,
            encryptedData: "encrypted-content-placeholder",
            status: "SOLD",
            minPrice: price,
        }).returning();

        console.log(`💾 Ticket saved to DB: ID ${newTicket.id}`);

        // 3. Mint on Blockchain
        // We use the buyer's wallet address from the DB
        const blockchainResult = await mintTicketOnChain(buyer.walletAddress, price);

        return NextResponse.json({
            success: true,
            data: {
                databaseId: newTicket.id,
                ...blockchainResult
            }
        });

    } catch (error: any) {
        console.error("Buy API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
