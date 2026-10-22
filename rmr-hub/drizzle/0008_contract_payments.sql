ALTER TABLE "invoices" ADD COLUMN "contract_id" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "contract_payment" integer;--> statement-breakpoint
CREATE INDEX "invoices_contract_idx" ON "invoices" USING btree ("contract_id");