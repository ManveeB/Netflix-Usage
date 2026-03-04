import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.usage.list.path, async (req, res) => {
    try {
      const sessions = await storage.getUsageSessions();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Failed to get usage sessions" });
    }
  });

  app.post(api.usage.create.path, async (req, res) => {
    try {
      const input = api.usage.create.input.parse(req.body);
      const session = await storage.createUsageSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.post(api.usage.generate.path, async (req, res) => {
    try {
      const prompt = `Generate a realistic Netflix viewing session. 
Return ONLY a valid JSON object with two fields:
- "showName": A popular or realistic sounding TV show or movie name.
- "durationMinutes": A random integer between 30 and 240 representing watch time in minutes.

Do not include markdown formatting like \`\`\`json, just the raw JSON.`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }]
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      
      const cleanJsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const generated = JSON.parse(cleanJsonStr);

      const parsedData = z.object({
        showName: z.string(),
        durationMinutes: z.number().min(30).max(240),
      }).parse(generated);

      const session = await storage.createUsageSession(parsedData);
      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate random session" });
    }
  });

  app.delete(api.usage.delete.path, async (req, res) => {
    try {
      await storage.deleteUsageSession(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Seed historical data if empty
  storage.getUsageSessions().then(async (sessions) => {
    // If we have less than 5 sessions, consider it "empty" and seed historical data
    if (sessions.length < 5) {
      const shows = ["Stranger Things", "The Crown", "Bridgerton", "Black Mirror", "The Witcher", "Money Heist", "Dark", "Ozark", "Mindhunter", "Succession"];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        // Add 1-2 sessions per day
        const numSessions = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numSessions; j++) {
          await storage.createUsageSession({
            showName: shows[Math.floor(Math.random() * shows.length)],
            durationMinutes: Math.floor(Math.random() * 210) + 30, // 30 to 240 mins
            watchedAt: date,
          });
        }
      }
    }
  }).catch(console.error);

  return httpServer;
}
