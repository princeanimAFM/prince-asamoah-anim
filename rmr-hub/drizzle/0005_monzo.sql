CREATE TABLE "monzo_account" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" integer,
	"account_id" text,
	"account_name" text,
	"connected_at" timestamp,
	"last_sync_at" timestamp,
	"last_error" text
);
