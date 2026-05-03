import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  roomCode: string;
  devices: string[];
  startedAt: Date;
  endedAt?: Date;
  totalCommentaries: number;
  matchState: {
    score: string;
    overs: string;
    wickets: string;
    batting: string;
    bowling: string;
    runRate: string;
  };
}

const SessionSchema = new Schema<ISession>({
  roomCode: { type: String, required: true, unique: true },
  devices: [{ type: String }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  totalCommentaries: { type: Number, default: 0 },
  matchState: {
    score: { type: String, default: '0/0' },
    overs: { type: String, default: '0.0' },
    wickets: { type: String, default: '0' },
    batting: { type: String, default: 'TBD' },
    bowling: { type: String, default: 'TBD' },
    runRate: { type: String, default: '0.00' },
  },
}, { timestamps: true });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
