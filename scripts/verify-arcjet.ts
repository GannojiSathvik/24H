
async function main() {
    const url = "http://localhost:3000/api/tickets/buy";
    console.log("🚀 Testing Arcjet Rate Limit...");


    // Dynamic fetch of IDs to avoid hardcoding mismatches
    const { db } = await import("../db");
    const { users, events } = await import("../db/schema");
    const { sql } = await import("drizzle-orm");

    console.log("🔍 Fetching latest test data from DB...");
    const [buyer] = await db.select().from(users).offset(1).limit(1); // Get 2nd user (Bob)
    const [seller] = await db.select().from(users).limit(1); // Get 1st user (Alice)
    const [event] = await db.select().from(events).limit(1);

    if (!buyer || !event || !seller) {
        console.error("❌ No seed data found! Run 'npx tsx scripts/seed.ts' first.");
        process.exit(1);
    }

    console.log(`   -> Using Buyer ID: ${buyer.id}, Event ID: ${event.id}`);

    const payload = {
        buyerId: buyer.id,
        eventId: event.id,
        sellerId: seller.id,
        price: 150
    };

    for (let i = 1; i <= 7; i++) {
        try {
            console.log(`\n📨 Request #${i}...`);
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            console.log(`   Status: ${res.status} ${res.statusText}`);
            if (res.status === 429) {
                console.log("   ✅ Rate Limit Triggered! (Expected)");
            } else if (res.status === 403) {
                console.log("   🚫 Access Denied (Bot Detected or Forbidden)");
            } else if (res.ok) {
                console.log("   ✅ Request Allowed");
            } else {
                console.log("   ⚠️ Other Error:", data);
            }

        } catch (err) {
            console.log("   ❌ Connection Failed. Is the server running?");
        }
    }
}

main();
