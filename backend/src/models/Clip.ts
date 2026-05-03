import mongoose, { Schema, Document } from 'mongoose';

export interface IClip extends Document {
  sessionId: string;
  startTimestamp: Date;
  duration: number;
  commentaryIds: string[];
  videoUrl?: string;
  shareToken: string;
}

const ClipSchema = new Schema<IClip>({
  sessionId: { type: String, required: true, index: true },
  startTimestamp: { type: Date, required: true },
  duration: { type: Number, required: true },
  commentaryIds: [{ type: String }],
  videoUrl: { type: String },
  shareToken: { type: String, unique: true },
}, { timestamps: true });

export const Clip = mongoose.model<IClip>('Clip', ClipSchema);
