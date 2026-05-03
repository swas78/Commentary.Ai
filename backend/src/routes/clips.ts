import { Router, Request, Response } from 'express';
import { Clip } from '../models/Clip';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { sessionId, startTimestamp, duration, commentaryIds } = req.body;
    const clip = await Clip.create({
      sessionId, startTimestamp: new Date(startTimestamp),
      duration, commentaryIds: commentaryIds || [],
      shareToken: uuid(),
    });
    res.status(201).json(clip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create clip' });
  }
});

router.get('/share/:shareToken', async (req: Request, res: Response) => {
  try {
    const clip = await Clip.findOne({ shareToken: req.params.shareToken });
    if (!clip) { res.status(404).json({ error: 'Clip not found' }); return; }
    res.json(clip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get clip' });
  }
});

export default router;
