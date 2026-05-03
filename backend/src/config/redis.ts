import Redis from 'ioredis';
import { logger } from '../middleware/logger';

let redis: Redis | null = null;

export async function connectRedis(): Promise<Redis> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 3000),
    lazyConnect: true,
  });

  redis.on('error', (err) => logger.error('Redis error:', err));
  redis.on('connect', () => logger.info('Redis connected'));

  await redis.connect();
  return redis;
}

export function getRedis(): Redis {
  if (!redis) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redis;
}

// ── Session State (TTL: 4 hours) ──────────────────────────────
export async function setSessionState(sessionId: string, state: Record<string, unknown>): Promise<void> {
  const r = getRedis();
  await r.set(`session:${sessionId}`, JSON.stringify(state), 'EX', 14400);
}

export async function getSessionState(sessionId: string): Promise<Record<string, unknown> | null> {
  const r = getRedis();
  const data = await r.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

// ── Commentary Buffer (last 50) ───────────────────────────────
export async function pushCommentary(sessionId: string, commentary: Record<string, unknown>): Promise<void> {
  const r = getRedis();
  const key = `commentary:${sessionId}`;
  await r.lpush(key, JSON.stringify(commentary));
  await r.ltrim(key, 0, 49);
  await r.expire(key, 14400);
}

export async function getCommentaryBuffer(sessionId: string): Promise<Record<string, unknown>[]> {
  const r = getRedis();
  const items = await r.lrange(`commentary:${sessionId}`, 0, 49);
  return items.map((item) => JSON.parse(item));
}

// ── Rate Limiting (Token Bucket) ──────────────────────────────
export async function checkRateLimit(key: string, maxTokens: number, refillRate: number): Promise<boolean> {
  const r = getRedis();
  const now = Date.now();
  const bucketKey = `ratelimit:${key}`;

  const data = await r.get(bucketKey);
  let tokens = maxTokens;
  let lastRefill = now;

  if (data) {
    const parsed = JSON.parse(data);
    tokens = parsed.tokens;
    lastRefill = parsed.lastRefill;
    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
  }

  if (tokens < 1) return false;

  tokens -= 1;
  await r.set(bucketKey, JSON.stringify({ tokens, lastRefill: now }), 'EX', 3600);
  return true;
}
