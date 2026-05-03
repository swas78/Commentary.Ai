import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();
const controller = new DeviceController();

router.get('/session/:sessionId', controller.getBySession);
router.post('/', controller.register);
router.patch('/:deviceId', controller.update);
router.delete('/:deviceId', controller.remove);

export default router;
