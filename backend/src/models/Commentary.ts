import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentary extends Document {
  text: string;
  sentiment: string;
  keywords: string[];
  sessionId: string;
  timestamp: Date;
  language: string;
  gestureTriggered: boolean;
  reactions: Map<string, number>;
}

const CommentarySchema = new Schema<ICommentary>({
  text: { type: String, required: true },
  sentiment: { type: String, default: 'neutral' },
  keywords: [{ type: String }],
  sessionId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  language: { type: String, default: 'en' },
  gestureTriggered: { type: Boolean, default: false },
  reactions: { type: Map, of: Number, default: {} },
}, { timestamps: true });

CommentarySchema.index({ sessionId: 1, timestamp: -1 });

export const Commentary = mongoose.model<ICommentary>('Commentary', CommentarySchema);
