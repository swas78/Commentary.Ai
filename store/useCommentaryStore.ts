import { create } from 'zustand';

export interface Commentary {
  id: string;
  text: string;
  sentiment: string;
  keywords: string[];
  timestamp: string;
  language: string;
  gestureTriggered?: boolean;
  reactions?: Record<string, number>;
}

interface CommentaryFilters {
  sentiment?: string;
  language?: string;
  search?: string;
}

interface CommentaryState {
  commentaries: Commentary[];
  filters: CommentaryFilters;
  addCommentary: (c: Commentary) => void;
  removeCommentary: (id: string) => void;
  clearAll: () => void;
  setFilters: (f: Partial<CommentaryFilters>) => void;
}

export const useCommentaryStore = create<CommentaryState>((set) => ({
  commentaries: [],
  filters: {},
  addCommentary: (c) => set((s) => ({ commentaries: [c, ...s.commentaries] })),
  removeCommentary: (id) => set((s) => ({ commentaries: s.commentaries.filter((c) => c.id !== id) })),
  clearAll: () => set({ commentaries: [] }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
}));
