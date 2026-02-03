
async function main() {
    const url = "http://localhost:3000/api/tickets/buy";
    console.log("🚀 Testing Arcjet Rate Limit...");

    // We need valid data to pass validation, regardless of whether Arcjet blocks us or not
    // (Arcjet blocks first, but if it passes, we don't want 400 Bad Request)
    // Assuming ID 1 exists for buyer/seller/event from previous seeds
    const payload = {
        buyerId: 5, // Bob (from recent seed)
        eventId: 3, // Coldplay (from recent seed)
        sellerId: 4, // Alice (from recent seed)
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
