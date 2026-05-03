import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  type: string;
  sessionId: string;
  latency: number;
  connectedAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  sessionId: { type: String, required: true, index: true },
  latency: { type: Number, default: 0 },
  connectedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);
