import axios, { type AxiosInstance } from 'axios';

// ── Types ─────────────────────────────────────────────────────
export interface GenerateCommentaryRequest {
  prompt: string;
  language?: string;
  tone?: string;
  matchState?: Record<string, string>;
}

export interface GenerateCommentaryResponse {
  id: string;
  text: string;
  sentiment: string;
  keywords: string[];
  timestamp: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  roomCode: string;
}

export interface AnalyticsResponse {
  totalCommentaries: number;
  avgLatency: number;
  sentimentBreakdown: Record<string, number>;
  topKeywords: string[];
}

export interface HealthResponse {
  status: string;
  uptime: number;
  version: string;
}

// ── Axios Instance ────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ── API Functions ─────────────────────────────────────────────
export async function healthCheck(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/api/health');
  return data;
}

export async function generateCommentary(req: GenerateCommentaryRequest): Promise<GenerateCommentaryResponse> {
  const { data } = await api.post<GenerateCommentaryResponse>('/api/commentary/generate', req);
  return data;
}

export async function createSession(): Promise<CreateSessionResponse> {
  const { data } = await api.post<CreateSessionResponse>('/api/sessions');
  return data;
}

export async function getAnalytics(sessionId: string): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>(`/api/analytics/${sessionId}`);
  return data;
}

export async function createClip(sessionId: string, startTimestamp: string, duration: number) {
  const { data } = await api.post('/api/clips', { sessionId, startTimestamp, duration });
  return data;
}

export async function updateMatchState(sessionId: string, matchState: Record<string, string>) {
  const { data } = await api.patch(`/api/sessions/${sessionId}/match-state`, matchState);
  return data;
}

export default api;
