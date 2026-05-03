import rateLimit from 'express-rate-limit';

export const httpRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const geminiRateLimit = rateLimit({
  windowMs: 1000, // 1 second
  max: 2, // 2 requests per second
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Gemini API rate limit exceeded. Max 2 calls/second.' },
});
