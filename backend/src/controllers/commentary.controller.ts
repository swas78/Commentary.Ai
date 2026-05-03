import { Request, Response } from 'express';
import { Commentary } from '../models/Commentary';
import { generateCommentary } from '../services/gemini.service';
import { pushCommentary } from '../config/redis';
import { logger } from '../middleware/logger';

export class CommentaryController {
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, language, tone, matchState, sessionId } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }

      const result = await generateCommentary({ prompt, language, tone, matchState });

      const commentary = await Commentary.create({
        text: result.text,
        sentiment: result.sentiment,
        keywords: result.keywords,
        sessionId: sessionId || 'default',
        language: language || 'en',
        timestamp: new Date(),
      });

      // Push to Redis buffer
      if (sessionId) {
        await pushCommentary(sessionId, {
          id: commentary._id,
          text: result.text,
          sentiment: result.sentiment,
          keywords: result.keywords,
          timestamp: commentary.timestamp,
        });
      }

      res.status(201).json({
        id: commentary._id,
        text: result.text,
        sentiment: result.sentiment,
        keywords: result.keywords,
        timestamp: commentary.timestamp,
      });
    } catch (error) {
      logger.error('Commentary generation error:', error);
      res.status(500).json({ error: 'Failed to generate commentary' });
    }
  }

  async getBySession(req: Request, res: Response): Promise<void> {
    try {
      const commentaries = await Commentary.find({ sessionId: req.params.sessionId })
        .sort({ timestamp: -1 }).limit(50);
      res.json(commentaries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch commentaries' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const commentary = await Commentary.findById(req.params.id);
      if (!commentary) { res.status(404).json({ error: 'Not found' }); return; }
      res.json(commentary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch commentary' });
    }
  }

  async deleteById(req: Request, res: Response): Promise<void> {
    try {
      await Commentary.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete commentary' });
    }
  }
}
