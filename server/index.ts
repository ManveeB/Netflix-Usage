import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerChatRoutes } from "./routes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// 1. API Routes must come first
registerChatRoutes(app);

// 2. Try to find the dashboard in any possible folder
const distPath = path.resolve(__dirname);
const publicPath = path.resolve(__dirname, "public");

app.use(express.static(publicPath));
app.use(express.static(distPath));

// 3. The "Smart" Catch-All
app.get("/{*splat}", (req, res) => {
  // Try /public/index.html first
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) {
      // If that fails, try /index.html in the root
      res.sendFile(path.join(distPath, "index.html"), (err2) => {
        if (err2) {
          res.status(404).send("Dashboard files not found. Check build logs.");
        }
      });
    }
  });
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
