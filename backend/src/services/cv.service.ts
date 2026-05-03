import { logger } from '../middleware/logger';

// Computer Vision service placeholder for future frame analysis
export async function analyzeFrame(_frameBuffer: Buffer): Promise<{
  description: string;
  action: string;
  players: string[];
}> {
  logger.info('CV: Frame analysis requested');
  return {
    description: 'Match in progress',
    action: 'batting',
    players: [],
  };
}
