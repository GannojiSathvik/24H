import { config } from "dotenv";
config({ path: ".env" });

async function main() {
    // Dynamic imports to ensure dotenv is loaded first
    const { db } = await import("../db");
    const { users, events, tickets, bids } = await import("../db/schema");

    console.log("🌱 Starting seed...");

    try {
        // 1. Clean Up
        console.log("🧹 Cleaning up existing data...");
        await db.delete(bids);
        await db.delete(tickets);
        await db.delete(events);
        await db.delete(users);

        // 2. Create Users
        console.log("👤 Creating users...");
        const [alice] = await db.insert(users).values({
            name: "Alice",
            walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
            latitude: 12.97,
            longitude: 77.59,
        }).returning();

        const [bob] = await db.insert(users).values({
            name: "Bob",
            walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1
            latitude: 12.98,
            longitude: 77.60,
        }).returning();

        console.log(`   -> Created Seller: Alice (ID: ${alice.id})`);
        console.log(`   -> Created Buyer: Bob (ID: ${bob.id})`);

        // 3. Create Event
        console.log("📅 Creating event...");
        // 2 hours from now
        const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

        const [concert] = await db.insert(events).values({
            name: "Coldplay Concert",
            startTime: startTime,
            venueLatitude: 12.97,
            venueLongitude: 77.59,
        }).returning();

        console.log(`   -> Created Event: ${concert.name} (ID: ${concert.id})`);

        // 4. Create Ticket
        console.log("🎫 Creating ticket...");
        const [ticket] = await db.insert(tickets).values({
            eventId: concert.id,
            sellerId: alice.id,
            ticketHash: "hash-123",
            encryptedData: "encrypted-file-content",
            status: "AVAILABLE",
            minPrice: 100.0, // Assuming a price
        }).returning();

        console.log(`   -> Created Ticket for Event ID: ${ticket.eventId} (Ticket ID: ${ticket.id})`);

        // Validation Log
        console.log("\n✅ DATABASE CONNECTION SUCCESSFUL: Ticket System is Live.");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
