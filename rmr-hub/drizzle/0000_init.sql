CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drive_folders" (
	"path" text PRIMARY KEY NOT NULL,
	"folder_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_account" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"email" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 100 NOT NULL,
	"unit_price" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"client_id" integer NOT NULL,
	"issue_date" text NOT NULL,
	"due_date" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"paid_date" text,
	"drive_file_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"business_name" text DEFAULT 'RMR Dev Works' NOT NULL,
	"owner_name" text DEFAULT 'Prince Asamoah Anim' NOT NULL,
	"email" text DEFAULT 'prince@rmrdevworks.co.uk' NOT NULL,
	"phone" text DEFAULT '07879 438525' NOT NULL,
	"website" text DEFAULT 'rmrdevworks.co.uk' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"bank_name" text DEFAULT 'Monzo' NOT NULL,
	"account_name" text DEFAULT '' NOT NULL,
	"sort_code" text DEFAULT '' NOT NULL,
	"account_number" text DEFAULT '' NOT NULL,
	"hourly_rate" integer DEFAULT 3500 NOT NULL,
	"payment_terms_days" integer DEFAULT 14 NOT NULL,
	"invoice_prefix" text DEFAULT 'RMR' NOT NULL,
	"next_invoice_number" integer DEFAULT 1 NOT NULL,
	"weekly_hour_limit" integer DEFAULT 20 NOT NULL,
	"salary" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"date" text NOT NULL,
	"minutes" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"billable" boolean DEFAULT true NOT NULL,
	"invoice_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"kind" text NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"external_id" text,
	"invoice_id" integer,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("number");--> statement-breakpoint
CREATE INDEX "time_entries_date_idx" ON "time_entries" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_external_idx" ON "transactions" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("date");