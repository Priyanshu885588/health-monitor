/**
 * Node.js Ingestion Layer - Production Grade
 * Features: Rate Limiting, Health Probes, Graceful Shutdown, Structured Logging
 */

const express = require("express");
const Redis = require("ioredis");
const rateLimit = require("express-rate-limit");
const { validateHeartRate } = require("./validator");

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. MIDDLEWARE & SECURITY ---

// Parse JSON payloads with a 10kb limit to prevent Body-Overflow attacks
app.use(express.json({ limit: "10kb" }));

// Rate Limiting: Prevent API abuse (Shift-Left Security)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// --- 2. DATABASE CONNECTION ---

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
  retryStrategy: (times) => {
    // Exponential backoff for production stability
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (err) => console.error("Redis Connection Error:", err));
redis.on("connect", () => console.log("Successfully connected to Redis"));

// --- 3. ROUTES ---

/**
 * @route   GET /health
 * @desc    Liveness and Readiness probe for DevSecOps monitoring
 */
app.get("/health", async (req, res) => {
  const isRedisConnected = redis.status === "ready";
  const status = isRedisConnected ? 200 : 503;

  res.status(status).json({
    status: isRedisConnected ? "UP and more to go" : "DOWN",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      redis: redis.status,
    },
  });
});

/**
 * @route   POST /ingest
 * @desc    Receives IoT data, validates, and pushes to Redis Stream
 */
app.post("/ingest", limiter, async (req, res) => {
  const { user_id, heart_rate } = req.body;

  // Automated Validation Gate
  if (!user_id || !validateHeartRate(heart_rate)) {
    return res.status(400).json({
      error: "Invalid Payload",
      details: "Provide a valid user_id and heart_rate (30-220).",
    });
  }

  try {
    // Push to Redis Stream 'health_events'
    // Using XADD * for auto-generated IDs
    const messageId = await redis.xadd(
      "health_events",
      "*",
      "user_id",
      user_id,
      "heart_rate",
      heart_rate.toString()
    );

    res.status(202).json({
      message: "Data Accepted",
      id: messageId,
    });
  } catch (err) {
    // Log error internally, but don't leak stack traces to client
    console.error("Ingestion Failure:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- 4. SERVER START & GRACEFUL SHUTDOWN ---

const server = app.listen(PORT, () => {
  console.log(`Ingestion Service active on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle SIGTERM (e.g., from Kubernetes or GitHub Actions Deployments)
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    redis.quit();
    process.exit(0);
  });
});

module.exports = app; // Export for testing purposes
