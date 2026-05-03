import { create } from 'zustand';

interface AvatarState {
  currentGesture: string;
  phoneme: string;
  expression: string;
  avatarId: string;
  setGesture: (gesture: string) => void;
  setPhoneme: (phoneme: string) => void;
  setExpression: (expression: string) => void;
  setAvatarId: (id: string) => void;
  reset: () => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  currentGesture: 'idle',
  phoneme: '',
  expression: 'neutral',
  avatarId: 'default',
  setGesture: (currentGesture) => set({ currentGesture }),
  setPhoneme: (phoneme) => set({ phoneme }),
  setExpression: (expression) => set({ expression }),
  setAvatarId: (avatarId) => set({ avatarId }),
  reset: () => set({ currentGesture: 'idle', phoneme: '', expression: 'neutral' }),
}));
