import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../middleware/logger';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export interface GenerateOptions {
  prompt: string;
  language?: string;
  tone?: string;
  matchState?: Record<string, string>;
}

export async function generateCommentary(options: GenerateOptions): Promise<{
  text: string;
  sentiment: string;
  keywords: string[];
}> {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

  const { prompt, language = 'English', tone = 'exciting', matchState } = options;
  let stateCtx = '';
  if (matchState) {
    stateCtx = `\nMatch state: Score ${matchState.score || 'N/A'}, Overs ${matchState.overs || 'N/A'}`;
  }

  const fullPrompt = `You are a world-class cricket commentator. Generate ${tone} commentary in ${language}.${stateCtx}\n\nSituation: ${prompt}\n\nRespond in JSON format: {"text": "...", "sentiment": "excited|tense|neutral|celebrating|disappointed", "keywords": ["word1", "word2"]}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Gemini generation failed:', error);
    return {
      text: `Commentary for: ${prompt}`,
      sentiment: 'neutral',
      keywords: [],
    };
  }
}
