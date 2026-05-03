import { Router, Request, Response } from 'express';
import { Session } from '../models/Session';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/', async (_req: Request, res: Response) => {
  try {
    const roomCode = uuid().substring(0, 6).toUpperCase();
    const session = await Session.create({ roomCode });
    res.status(201).json({ sessionId: session._id, roomCode: session.roomCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

router.patch('/:sessionId/match-state', async (req: Request, res: Response) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.sessionId,
      { $set: { matchState: req.body } },
      { new: true }
    );
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match state' });
  }
});

export default router;
