import { getRedis, setSessionState, getSessionState } from '../config/redis';
import { logger } from '../middleware/logger';

export async function syncSessionState(sessionId: string, state: Record<string, unknown>): Promise<void> {
  await setSessionState(sessionId, state);
  const redis = getRedis();
  await redis.publish('session-sync', JSON.stringify({ sessionId, state }));
  logger.debug(`Sync: State published for session ${sessionId}`);
}

export async function getLatestState(sessionId: string): Promise<Record<string, unknown> | null> {
  return getSessionState(sessionId);
}
