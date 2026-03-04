export { registerChatRoutes } from "./routes";
export { chatStorage, type IChatStorage } from "./storage";
import express from "express";
import { registerChatRoutes } from "./routes";

const app = express();
app.use(express.json());

// Register your routes
const server = registerChatRoutes(app);

const PORT = Number(process.env.PORT) || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
