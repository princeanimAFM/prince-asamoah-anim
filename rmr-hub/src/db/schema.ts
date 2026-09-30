import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/** Money columns hold whole pence. Dates are "YYYY-MM-DD" text. */

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull().default("RMR Dev Works"),
  ownerName: text("owner_name").notNull().default("Prince Asamoah Anim"),
  email: text("email").notNull().default("prince@rmrdevworks.co.uk"),
  phone: text("phone").notNull().default("07879 438525"),
  website: text("website").notNull().default("rmrdevworks.co.uk"),
  address: text("address").notNull().default(""),
  bankName: text("bank_name").notNull().default("Monzo"),
  accountName: text("account_name").notNull().default(""),
  sortCode: text("sort_code").notNull().default(""),
  accountNumber: text("account_number").notNull().default(""),
  hourlyRate: integer("hourly_rate").notNull().default(3500),
  paymentTermsDays: integer("payment_terms_days").notNull().default(14),
  invoicePrefix: text("invoice_prefix").notNull().default("RMR"),
  nextInvoiceNumber: integer("next_invoice_number").notNull().default(1),
  weeklyHourLimit: integer("weekly_hour_limit").notNull().default(20),
  /** Expected PAYE salary for the tax year, used by the tax estimate. */
  salary: integer("salary").notNull().default(0),
  /** scotland | rest_of_uk: Scotland has its own income tax bands. */
  taxRegion: text("tax_region").notNull().default("scotland"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    number: text("number").notNull(),
    clientId: integer("client_id").notNull().references(() => clients.id),
    issueDate: text("issue_date").notNull(),
    dueDate: text("due_date").notNull(),
    /** draft | sent | paid | void */
    status: text("status").notNull().default("draft"),
    notes: text("notes").notNull().default(""),
    paidDate: text("paid_date"),
    driveFileId: text("drive_file_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("invoices_number_idx").on(t.number)],
);

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  /** Quantity in hundredths, so 1.5 hours is 150. */
  quantity: integer("quantity").notNull().default(100),
  unitPrice: integer("unit_price").notNull(),
  position: integer("position").notNull().default(0),
});

export const timeEntries = pgTable(
  "time_entries",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").references(() => clients.id),
    date: text("date").notNull(),
    minutes: integer("minutes").notNull(),
    description: text("description").notNull().default(""),
    billable: boolean("billable").notNull().default(true),
    invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("time_entries_date_idx").on(t.date)],
);

/**
 * Money in and out of the business account.
 * kind: income | expense | tax_saving (moved to the tax pot) | tax_payment (paid to HMRC) | ignore
 */
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    date: text("date").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    kind: text("kind").notNull(),
    source: text("source").notNull().default("manual"),
    externalId: text("external_id"),
    invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("transactions_external_idx").on(t.externalId), index("transactions_date_idx").on(t.date)],
);

/**
 * Client contracts. A contract is edited as a draft, then "sent": its text is frozen
 * (bodyHash) and a secret signing link (token) is created. The client signs on a public
 * page; the signature, time, IP and browser are kept as the audit record.
 * status: draft | sent | signed | void
 */
export const contracts = pgTable(
  "contracts",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("draft"),
    token: text("token"),
    bodyHash: text("body_hash"),
    sentAt: timestamp("sent_at"),
    signedAt: timestamp("signed_at"),
    signerName: text("signer_name"),
    signatureImage: text("signature_image"),
    signerIp: text("signer_ip"),
    signerAgent: text("signer_agent"),
    driveFileId: text("drive_file_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("contracts_token_idx").on(t.token)],
);

/** The signed-in Google account, kept so the app can save files to Drive. */
export const googleAccount = pgTable("google_account", {
  id: integer("id").primaryKey().default(1),
  email: text("email").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Cache of Drive folder ids by path, e.g. "Invoices/2025-26". */
export const driveFolders = pgTable("drive_folders", {
  path: text("path").primaryKey(),
  folderId: text("folder_id").notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
