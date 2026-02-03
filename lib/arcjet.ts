import arcjet, { detectBot, tokenBucket } from "@arcjet/next";

const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        // 1. Bot Detection
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only.
            // Block all bots except common search engines is the default, 
            // but user asked to "Block ALL automated clients" so we pass empty allow list or rely on default STRICT nature if implicit.
            // However, typical usage allows search engines. 
            // To strictly follow "Block ALL automated clients", we maintain the default blocks.
            allow: [],
        }),
        // 2. Rate Limiting (Token Bucket)
        tokenBucket({
            mode: "LIVE",
            refillRate: 5, // Refill 5 tokens per interval
            interval: 60, // 60 seconds
            capacity: 5, // Max 5 tokens
        }),
    ],
});

export default aj;
