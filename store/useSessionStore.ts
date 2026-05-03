import { create } from 'zustand';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface MatchState {
  teamA?: string;
  teamB?: string;
  score?: string;
  overs?: string;
  runRate?: string;
  reqRunRate?: string;
  batsman1?: { name: string; runs: number; balls: number };
  batsman2?: { name: string; runs: number; balls: number };
  bowler?: { name: string; overs: string; wickets: number; runs: number };
  recentBalls?: ('W' | '4' | '6' | '0' | '1' | '2')[];
  partnership?: { runs: number; balls: number };
}

interface SessionState {
  sessionId: string | null;
  roomCode: string | null;
  isLive: boolean;
  connectionStatus: ConnectionStatus;
  devices: Array<{ id: string; latency: number }>;
  matchState: MatchState;
  setSession: (sessionId: string, roomCode: string) => void;
  setLive: (isLive: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setMatchState: (state: Partial<MatchState> | ((prev: MatchState) => MatchState)) => void;
  setDevices: (devices: Array<{ id: string; latency: number }>) => void;
  resetSession: () => void;
}

const defaultMatchState: MatchState = {
  score: '0/0',
  overs: '0.0',
  runRate: '0.00',
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  roomCode: null,
  isLive: false,
  connectionStatus: 'disconnected',
  devices: [],
  matchState: defaultMatchState,

  setSession: (sessionId, roomCode) => set({ sessionId, roomCode }),
  setLive: (isLive) => set({ isLive }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setDevices: (devices) => set({ devices }),
  setMatchState: (state) => set((prev) => ({
    matchState: typeof state === 'function' ? state(prev.matchState) : { ...prev.matchState, ...state }
  })),
  resetSession: () => set({
    sessionId: null,
    roomCode: null,
    isLive: false,
    connectionStatus: 'disconnected',
    devices: [],
    matchState: defaultMatchState,
  }),
}));
