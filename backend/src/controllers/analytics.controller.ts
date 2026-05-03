import { Request, Response } from 'express';
import { Commentary } from '../models/Commentary';
import { Session } from '../models/Session';

export class AnalyticsController {
  async getSessionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await Session.findById(sessionId);
      if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

      const commentaries = await Commentary.find({ sessionId });
      const sentimentBreakdown: Record<string, number> = {};
      const keywordCount: Record<string, number> = {};

      commentaries.forEach((c) => {
        sentimentBreakdown[c.sentiment] = (sentimentBreakdown[c.sentiment] || 0) + 1;
        c.keywords.forEach((k) => { keywordCount[k] = (keywordCount[k] || 0) + 1; });
      });

      const topKeywords = Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k]) => k);

      res.json({
        totalCommentaries: commentaries.length,
        avgLatency: 0,
        sentimentBreakdown,
        topKeywords,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }
}
