import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: false,
      retryStrategy: () => null
    });
    client.on("error", () => {});
    globalForRedis.redis = client;
  }
  return globalForRedis.redis;
}

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  resetSeconds: number;
};

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  try {
    const redis = getRedis();
    if (redis.status === "wait") {
      await redis.connect();
    }
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = await redis.ttl(key);
    return {
      allowed: count <= limit,
      count,
      remaining: Math.max(limit - count, 0),
      resetSeconds: ttl > 0 ? ttl : windowSeconds
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return {
      allowed: true,
      count: 0,
      remaining: limit,
      resetSeconds: windowSeconds
    };
  }
}

export async function publishJson(channel: string, payload: unknown): Promise<void> {
  try {
    const redis = getRedis();
    if (redis.status === "wait") {
      await redis.connect();
    }
    await redis.publish(channel, JSON.stringify(payload));
  } catch {
    // Redis unavailable — skip publish
  }
}
