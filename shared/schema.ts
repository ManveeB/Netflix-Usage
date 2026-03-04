import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usageSessions = pgTable("usage_sessions", {
  id: serial("id").primaryKey(),
  showName: text("show_name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
});

export const insertUsageSessionSchema = createInsertSchema(usageSessions, {
  watchedAt: z.coerce.date(),
}).omit({ id: true });
export type InsertUsageSession = z.infer<typeof insertUsageSessionSchema>;
export type UsageSession = typeof usageSessions.$inferSelect;
