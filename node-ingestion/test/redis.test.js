const Redis = require("ioredis");

describe("Redis Stream Integration", () => {
  let redis;

  beforeAll(() => {
    // Connects to the Redis container defined in your YAML
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: 6379,
    });
  });

  afterAll(async () => {
    await redis.quit();
  });

  test("should successfully write to the health_events stream", async () => {
    const testData = { user_id: "test_1", heart_rate: "85" };

    // Push to stream
    const messageId = await redis.xadd(
      "health_events",
      "*",
      "user_id",
      testData.user_id,
      "heart_rate",
      testData.heart_rate,
    );

    // Verify we got a message ID back (usually something like "162...-0")
    expect(messageId).toContain("-");

    // Read it back to confirm
    const streamData = await redis.xrange("health_events", "-", "+");
    expect(streamData.length).toBeGreaterThan(0);
    expect(streamData[0][1]).toContain(testData.user_id);
  });
});
