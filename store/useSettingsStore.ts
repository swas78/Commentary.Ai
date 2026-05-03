import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioSettings {
  volume: number;
  pitch: number;
  rate: number;
}

interface SettingsState {
  language: string;
  tone: string;
  avatarId: string;
  voiceId: string;
  audioSettings: AudioSettings;
  theme: 'dark' | 'light';
  setLanguage: (language: string) => void;
  setTone: (tone: string) => void;
  setAvatarId: (id: string) => void;
  setVoiceId: (id: string) => void;
  setAudioSettings: (s: Partial<AudioSettings>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      tone: 'exciting',
      avatarId: 'default',
      voiceId: 'default',
      audioSettings: { volume: 80, pitch: 1, rate: 1 },
      theme: 'dark',
      setLanguage: (language) => set({ language }),
      setTone: (tone) => set({ tone }),
      setAvatarId: (avatarId) => set({ avatarId }),
      setVoiceId: (voiceId) => set({ voiceId }),
      setAudioSettings: (s) => set((state) => ({ audioSettings: { ...state.audioSettings, ...s } })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'cricket-ai-settings' }
  )
);
