import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerChatRoutes } from "./routes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// 1. Register API routes FIRST
registerChatRoutes(app);

// 2. Define publicPath ONLY ONCE
const publicPath = path.resolve(__dirname, "public");
const distPath = path.resolve(__dirname);

// 3. Serve static files from both potential locations
app.use(express.static(publicPath));
app.use(express.static(distPath));

// 4. Catch-all route for React routing (Express 5 syntax)
app.get("/{*splat}", (req, res) => {
  const file = path.join(publicPath, "index.html");
  res.sendFile(file, (err) => {
    if (err) {
      // If not in /public, try the root dist folder
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
