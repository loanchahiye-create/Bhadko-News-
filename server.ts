import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("banners.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_photo_name TEXT,
    banner_type TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/log-generation", (req, res) => {
    const { photoName, bannerType } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO generations (user_photo_name, banner_type) VALUES (?, ?)");
      stmt.run(photoName || "anonymous", bannerType || "default");
      res.json({ success: true });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to log generation" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM generations").get() as { count: number };
      const recent = db.prepare("SELECT * FROM generations ORDER BY timestamp DESC LIMIT 10").all();
      res.json({ total: total.count, recent });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
