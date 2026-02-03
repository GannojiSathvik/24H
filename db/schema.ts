import { pgTable, serial, text, timestamp, boolean, doublePrecision, integer } from 'drizzle-orm/pg-core';

// 1. USERS (Buyers & Sellers)
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    walletAddress: text('wallet_address'), // For the decentralized part
    latitude: doublePrecision('latitude'), // CURRENT location of user
    longitude: doublePrecision('longitude'), // CURRENT location of user
});

// 2. EVENTS (The "Time & Location" Core)
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    startTime: timestamp('start_time').notNull(), // Critical for "Time Left" logic
    venueLatitude: doublePrecision('venue_lat').notNull(),
    venueLongitude: doublePrecision('venue_long').notNull(),
});

// 3. TICKETS (The "Rescue" Item)
export const tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').references(() => events.id),
    sellerId: integer('seller_id').references(() => users.id),

    // THE ANTI-SCAM CORE
    ticketHash: text('ticket_hash').notNull().unique(), // The fingerprint of the file
    isDecrypted: boolean('is_decrypted').default(false), // Hidden until sold
    encryptedData: text('encrypted_data').notNull(), // The actual ticket file (encrypted)

    status: text('status').default('AVAILABLE'), // AVAILABLE, SOLD, EXPIRED
    minPrice: doublePrecision('min_price').notNull(),
});

// 4. BIDS (The "Handshake")
export const bids = pgTable('bids', {
    id: serial('id').primaryKey(),
    ticketId: integer('ticket_id').references(() => tickets.id),
    buyerId: integer('buyer_id').references(() => users.id),
    amount: doublePrecision('amount').notNull(),
    status: text('status').default('PENDING'),
});
