import { Router } from 'express';
import { CommentaryController } from '../controllers/commentary.controller';
import { geminiRateLimit } from '../middleware/rateLimit';

const router = Router();
const controller = new CommentaryController();

router.post('/generate', geminiRateLimit, controller.generate);
router.get('/session/:sessionId', controller.getBySession);
router.get('/:id', controller.getById);
router.delete('/:id', controller.deleteById);

export default router;
