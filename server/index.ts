import express from "express";
import { registerChatRoutes } from "./routes.ts"; // Added .ts for consistency

const app = express();
app.use(express.json());

// Register your routes
registerChatRoutes(app);

const PORT = Number(process.env.PORT) || 10000;

// We use 'app.listen' directly to avoid the 'undefined' error
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export { registerChatRoutes };
