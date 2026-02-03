CREATE TABLE "bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer,
	"buyer_id" integer,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"venue_lat" double precision NOT NULL,
	"venue_long" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"seller_id" integer,
	"ticket_hash" text NOT NULL,
	"is_decrypted" boolean DEFAULT false,
	"encrypted_data" text NOT NULL,
	"status" text DEFAULT 'AVAILABLE',
	"min_price" double precision NOT NULL,
	CONSTRAINT "tickets_ticket_hash_unique" UNIQUE("ticket_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"wallet_address" text,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;