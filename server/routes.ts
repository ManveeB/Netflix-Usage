import type { Express, Request, Response } from "express";
import { chatStorage } from "./storage";

export function registerChatRoutes(app: Express): void {
  // This helper handles the "handshake" for every name the frontend might use
  const handleDataRequest = async (res: Response) => {
    try {
      const data = await chatStorage.getAllConversations();
      // We send both the raw array and the object-wrapped version
      res.json({ sessions: data, conversations: data, data: data }); 
    } catch (error) {
      res.status(500).json({ error: "Server Error" });
    }
  };

  // Map every potential name to the same data
  app.get("/api/sessions", (req, res) => handleDataRequest(res));
  app.get("/api/conversations", (req, res) => handleDataRequest(res));
  app.get("/api/usage", (req, res) => handleDataRequest(res));
  app.get("/api/chat", (req, res) => handleDataRequest(res));

  // Placeholder for the AI message route (simplified to prevent build errors)
  app.post("/api/conversations/:id/messages", async (req, res) => {
    res.status(200).json({ message: "AI response pending configuration" });
  });
}
