ALTER TABLE "invoices" ADD COLUMN "emailed_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reminder_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "last_reminder_date" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "auto_reminders" boolean DEFAULT false NOT NULL;