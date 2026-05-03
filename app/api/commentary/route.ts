import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting for Edge/Serverless environments
// In production, this should be backed by Redis as per the plan
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS = 2;
const ipHits = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let record = ipHits.get(ip);
  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    record = { count: 1, lastReset: now };
  } else {
    record.count += 1;
  }
  ipHits.set(ip, record);
  return record.count <= MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Max 2 calls/second.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { detectedAction, matchState, previousCommentary, tone, language } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured in the environment.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Construct the context-aware prompt
    const stateStr = matchState 
      ? `Match: ${matchState.teamA || 'Team A'} vs ${matchState.teamB || 'Team B'}. Score: ${matchState.score || '0/0'}. Overs: ${matchState.overs || '0.0'}.`
      : 'Match state unknown.';
      
    const recentCtx = previousCommentary && previousCommentary.length > 0
      ? `Previous commentary: "${previousCommentary.slice(-3).join(' " | " ')}"`
      : '';

    const systemPrompt = `You are an expert, highly engaging, and passionate cricket commentator.
Your tone must be: ${tone || 'excited'}.
Respond in Language: ${language || 'en'}.

Current Context:
${stateStr}
Action just detected: ${detectedAction || 'A standard delivery'}
${recentCtx}

INSTRUCTIONS:
1. Generate ONE vivid, accurate, emotionally engaging ball-by-ball commentary sequence.
2. Keep it to 2-3 short sentences max. It must sound natural and spoken.
3. React to the specific action detected.
4. You MUST format your response exactly like this:
<text>Your spoken commentary goes here</text>
<metadata>{"sentiment": "excited|disappointed|neutral|tense|celebrating"}</metadata>`;

    // Initiate streaming request
    const result = await model.generateContentStream(systemPrompt);
    
    // Create a ReadableStream to stream the response back to the client using SSE format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('Error while streaming:', err);
          controller.error(err);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Commentary generation failed:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Failed to generate commentary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
