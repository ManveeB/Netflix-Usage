import { db } from "./db";
import { usageSessions, type InsertUsageSession, type UsageSession } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUsageSessions(): Promise<UsageSession[]>;
  createUsageSession(session: InsertUsageSession): Promise<UsageSession>;
  deleteUsageSession(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUsageSessions(): Promise<UsageSession[]> {
    return await db.select().from(usageSessions).orderBy(desc(usageSessions.watchedAt));
  }

  async createUsageSession(session: InsertUsageSession): Promise<UsageSession> {
    const [newSession] = await db.insert(usageSessions).values(session).returning();
    return newSession;
  }

  async deleteUsageSession(id: number): Promise<void> {
    await db.delete(usageSessions).where(eq(usageSessions.id, id));
  }
}

export const storage = new DatabaseStorage();
