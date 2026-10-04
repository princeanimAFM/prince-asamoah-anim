CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"token" text,
	"body_hash" text,
	"sent_at" timestamp,
	"signed_at" timestamp,
	"signer_name" text,
	"signature_image" text,
	"signer_ip" text,
	"signer_agent" text,
	"drive_file_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contracts_token_idx" ON "contracts" USING btree ("token");