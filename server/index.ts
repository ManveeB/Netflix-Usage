import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerChatRoutes } from "./routes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1. ADD THIS: This tells the browser it's safe to load your data
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());

// 2. Register API routes
registerChatRoutes(app);

// 3. Serve static files
const distPath = path.resolve(__dirname);
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));
app.use(express.static(distPath));

// 4. Fallback for React Routing
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
