import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const healthCheck = pgTable("health_check", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
