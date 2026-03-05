import type { Express, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { chatStorage } from "./storage";

const anthropic = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY 
  ? new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    })
  : null;

export function registerChatRoutes(app: Express): void {
  const sendData = async (res: Response) => {
    try {
      const data = await chatStorage.getAllConversations();
      // WE SEND BOTH: Array and Object-wrapped to satisfy any template
      res.json({ sessions: data, conversations: data, data: data }); 
    } catch (error) {
      console.error("Data fetch error:", error);
      res.status(500).json({ error: "Data fetch failed" });
    }
  };

  // Map all possible GET endpoints
  app.get("/api/sessions", (req, res) => sendData(res));
  app.get("/api/conversations", (req, res) => sendData(res));
  app.get("/api/usage", (req, res) => sendData(res));

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) return res.status(404).json({ error: "Not found" });
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      if (!anthropic) return res.status(500).json({ error: "AI not configured" });
      
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      await chatStorage.createMessage(conversationId, "user", content);

      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = anthropic.messages.stream({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        messages: chatMessages,
      });

      let fullResponse = "";
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          const text = event.delta.text;
