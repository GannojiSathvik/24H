import { config } from "dotenv";
config({ path: ".env" });

async function main() {
    // Dynamic imports to ensure dotenv is loaded first
    const { db } = await import("../db");
    const { users, tickets, events } = await import("../db/schema");
    const { mintTicketOnChain } = await import("../lib/blockchain");
    const { eq } = await import("drizzle-orm");

    console.log("🚀 Starting Full Stack Verification...");

    try {
        // 1. DB Action: Create/Find User "Alice"
        // Using Wallet Address as unique identifier for this test
        const aliceWallet = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat Account #1

        console.log("👤 Creating/Finding User Alice in DB...");
        let [alice] = await db.select().from(users).where(eq(users.walletAddress, aliceWallet));

        if (!alice) {
            [alice] = await db.insert(users).values({
                name: "Alice Verification",
                walletAddress: aliceWallet,
                latitude: 40.7128,
                longitude: -74.0060,
            }).returning();
        }
        console.log(`✅ User Created/Found in DB (ID: ${alice.id})`);

        // 1b. Create/Find Event "Coldplay"
        console.log("📅 Creating/Finding Event 'Coldplay' in DB...");
        let [event] = await db.select().from(events).where(eq(events.name, "Coldplay Verification Concert"));
        if (!event) {
            [event] = await db.insert(events).values({
                name: "Coldplay Verification Concert",
                startTime: new Date(Date.now() + 10000000), // Future date
                venueLatitude: 40.7128,
                venueLongitude: -74.0060
            }).returning();
        }
        console.log(`✅ Event Created/Found in DB (ID: ${event.id})`);

        // 2. DB Action: Create Ticket
        console.log("🎫 Creating Ticket in DB...");
        const [ticket] = await db.insert(tickets).values({
            eventId: event.id,
            sellerId: alice.id,
            ticketHash: `verify-hash-${Date.now()}`,
            encryptedData: "verification-encrypted-data",
            status: "AVAILABLE",
            minPrice: 0.1,
        }).returning();
        console.log(`✅ Ticket Created in DB (ID: ${ticket.id})`);

        // 3 & 4. Blockchain Action: Mint Ticket
        // We are simulating that Alice is buying/minting this ticket, or we are minting it FOR Alice.
        // The prompt says "Call the mintTicket function ... for Alice".
        console.log("🔗 Minting Ticket on Blockchain...");

        // Using a fake price of 1 (ETH) for simulation
        const result = await mintTicketOnChain(alice.walletAddress!, 1);

        console.log(`✅ Ticket Minted on Blockchain (Tx Hash: ${result.transactionHash})`);
        console.log(`🎉 FULL STACK VERIFICATION SUCCESSFUL!`);

    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
