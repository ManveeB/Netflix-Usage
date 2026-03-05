import { sessions, type Session, type InsertSession } from "../shared/schema.ts";

export interface IStorage {
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
}

export class MemStorage implements IStorage {
  private sessions: Map<number, Session>;
  private currentId: number;

  constructor() {
    this.sessions = new Map();
    this.currentId = 1;
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentId++;
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }
}

export const chatStorage = new MemStorage();
