import { type Session, type InsertSession } from "../shared/schema";

export interface IStorage {
  getConversation(id: number): Promise<any>;
  getAllConversations(): Promise<any[]>;
  getMessagesByConversation(id: number): Promise<any[]>;
  createConversation(title: string): Promise<any>;
  createMessage(convId: number, role: string, content: string): Promise<any>;
  deleteConversation(id: number): Promise<void>;
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
