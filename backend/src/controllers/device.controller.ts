import { Request, Response } from 'express';
import { Device } from '../models/Device';

export class DeviceController {
  async getBySession(req: Request, res: Response): Promise<void> {
    try {
      const devices = await Device.find({ sessionId: req.params.sessionId });
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, name, type, sessionId } = req.body;
      const device = await Device.findOneAndUpdate(
        { deviceId },
        { deviceId, name, type, sessionId, connectedAt: new Date() },
        { upsert: true, new: true }
      );
      res.status(201).json(device);
    } catch (error) {
      res.status(500).json({ error: 'Failed to register device' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const device = await Device.findOneAndUpdate(
        { deviceId: req.params.deviceId },
        { $set: req.body },
        { new: true }
      );
      if (!device) { res.status(404).json({ error: 'Device not found' }); return; }
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update device' });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      await Device.findOneAndDelete({ deviceId: req.params.deviceId });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove device' });
    }
  }
}
