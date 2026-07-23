require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes/index");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/errorMiddleware");

const app = express();

// ── Security & parsing middleware ──────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Rate limiting (basic abuse protection) ──────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "textile-monitor-backend", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────
app.use("/api", routes);

// ── 404 + centralized error handling ──────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

// Allow `node src/app.js` to start the server directly (per package.json's
// "main" + "start" script), while still letting tests import the app
// without binding a port.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🧵 Textile Monitor API running on port ${PORT}`);
  });
}
