import { type Session, type InsertSession } from "../shared/schema";

export interface IStorage {
  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.currentId = 1;

    // FIX 1: Seed the storage so the frontend doesn't see "null" or "empty"
    this.createConversation("Welcome to your Netflix Tracker");
  }

  async getAllConversations() { 
    const data = Array.from(this.conversations.values());
    // FIX 2: Most templates expect the array itself, 
    // but some expect { sessions: data }. 
    // Let's start by ensuring it returns a clean array.
    return data; 
  }
  export class MemStorage implements IStorage {
  private conversations: Map<number, any>;
  private messages: Map<number, any[]>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.currentId = 1;

    // ADD THIS: Seed the storage with one entry so the dashboard isn't empty
    this.createConversation("Netflix Usage Analysis - Main Dashboard");
  }

  async getAllConversations() { 
    // This ensures the frontend gets an array of data immediately
    return Array.from(this.conversations.values());
  }
  
  // ... (keep the rest of your methods as they are)
}
}

export class MemStorage implements IStorage {
  private conversations: Map<number, any>;
  private messages: Map<number, any[]>;
  private currentId: number;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.currentId = 1;
  }

  async getAllConversations() { return Array.from(this.conversations.values()); }
  async getConversation(id: number) { return this.conversations.get(id); }
  async getMessagesByConversation(id: number) { return this.messages.get(id) || []; }

  async createConversation(title: string) {
    const id = this.currentId++;
    const conv = { id, title, createdAt: new Date() };
    this.conversations.set(id, conv);
    return conv;
  }

  async createMessage(conversationId: number, role: string, content: string) {
    const msgs = this.messages.get(conversationId) || [];
    const newMsg = { id: Math.random(), conversationId, role, content };
    msgs.push(newMsg);
    this.messages.set(conversationId, msgs);
    return newMsg;
  }

  async deleteConversation(id: number) { this.conversations.delete(id); }
}

export const chatStorage = new MemStorage();
