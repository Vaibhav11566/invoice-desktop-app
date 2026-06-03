import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import invoiceRoutes from "./src/routes/invoice.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend folder itself (works in both dev and packaged prod)
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
await connectDB();

// Middleware — allow all origins including Electron's null origin (file:// pages)
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Invoice API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use.\n` +
      `   Fix: Run this in terminal →  npx kill-port ${PORT}\n` +
      `   Or close any other running instance of the app.`
    );
    process.exit(1);
  } else {
    throw err;
  }
});

export default app;
