import express from "express";
import path from "path"; // 1. Add this import
import { fileURLToPath } from "url"; // 2. Add this for ESM support
import { registerChatRoutes } from "./routes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// Register your API routes first
registerChatRoutes(app);

// 3. Add this block to serve the React frontend
const publicPath = path.join(__dirname, "public"); 
app.use(express.static(publicPath));

// Ensure any non-API request serves the index.html (for React routing)
app.get("/(.*)", (req, res) => { // Updated for Express 5 naming requirements
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
