const fastify = require("fastify")({ logger: true });
const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
});
//fastify is faster then express more and more
// Endpoint to receive heart rate data
fastify.post("/ingest", async (request, reply) => {
  const { device_id, user_id, heart_rate } = request.body;

  try {
    // XADD adds the data to a Redis Stream named 'health_events'
    // '*' tells Redis to auto-generate a timestamp-based ID
    const messageId = await redis.xadd(
      "health_events",
      "*",
      "device_id",
      device_id,
      "user_id",
      user_id,
      "heart_rate",
      heart_rate,
      "timestamp",
      new Date().toISOString(),
    );

    return { status: "success", messageId };
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ status: "error", message: "Failed to stream data" });
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
