import { useState, useCallback, useRef } from 'react';
import { useCommentaryStore } from '@/store/useCommentaryStore';
import { useSessionStore } from '@/store/useSessionStore';

// Fallback bank when API fails or rate limits
const FALLBACK_BANK = {
  excited: [
    "Oh, what a magnificent shot! That's gone miles into the crowd for SIX!",
    "He's hit that with absolute power! A glorious FOUR through the covers.",
    "Bowled him! Cleaned him up! What a spectacular delivery to take the WICKET!",
  ],
  technical: [
    "Excellent seam presentation there. The ball shapes away late, beating the outside edge.",
    "He's used the depth of the crease beautifully to punch that off the back foot for FOUR.",
    "A textbook forward defense. Right over the ball, killing the spin entirely.",
  ],
  neutral: [
    "Pushed away to the off-side for a quick single.",
    "A solid defensive shot, no run taken.",
    "Just a little bit of width, cut away for a single down to third man.",
  ]
};

interface CommentaryParams {
  detectedAction?: string;
  tone?: 'excited' | 'technical' | 'neutral';
  language?: string;
  personaId?: string;
}

// Speak text using browser Web Speech API
const speakText = (text: string, personaId: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  // Don't speak empty strings or just punctuation
  const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();
  
  // Basic voice matching based on persona
  if (personaId === 'harsha') {
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    utterance.voice = voices.find(v => /en-IN|en-GB/i.test(v.lang)) || null;
  } else if (personaId === 'ravi') {
    utterance.pitch = 1.2;
    utterance.rate = 1.1;
    utterance.voice = voices.find(v => /hi-IN/i.test(v.lang)) || null;
  }
  
  window.speechSynthesis.speak(utterance);
};

export function useCommentary() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { addCommentary, commentaries } = useCommentaryStore();
  const { matchState } = useSessionStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateCommentary = useCallback(async (params: CommentaryParams = {}) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStreamingText('');
    
    // Setup abort controller for cancelation
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const requestBody = {
      detectedAction: params.detectedAction || 'General play',
      tone: params.tone || 'excited',
      language: params.language || 'en',
      personaId: params.personaId || 'harsha',
      matchState,
      previousCommentary: commentaries.slice(0, 5).map(c => c.text).reverse(),
    };

    try {
      // --- NO-API DEMO MODE LOGIC ---
      const isDemoMode = typeof window !== 'undefined' && window.location.search.includes('demo=true');
      
      if (isDemoMode) {
        // Pre-recorded cinematic responses for judging demo without API keys
        const mockResponses = [
          "<text>What an absolute screamer of a shot! He has picked the bones out of that delivery and sent it sailing into the second tier.</text><sentiment>{\"sentiment\": 0.95, \"keywords\": [\"screamer\", \"six\", \"powerful\"], \"gestureHint\": \"excited_arms_up\"}</sentiment>",
          "<text>Oh, that's beautifully timed. Just a mere push and it races away to the extra cover boundary. Class written all over it.</text><sentiment>{\"sentiment\": 0.8, \"keywords\": [\"beautiful\", \"boundary\", \"class\"], \"gestureHint\": \"nodding_approval\"}</sentiment>",
          "<text>Edged and taken! A magnificent catch behind the stumps. The bowler gets the crucial breakthrough they desperately needed.</text><sentiment>{\"sentiment\": 0.2, \"keywords\": [\"wicket\", \"edge\", \"catch\"], \"gestureHint\": \"shocked_hands_to_head\"}</sentiment>",
          "<text>He defends that solidly back to the bowler. Sensible cricket, just playing out the dangerous spell.</text><sentiment>{\"sentiment\": 0.5, \"keywords\": [\"defend\", \"solid\", \"sensible\"], \"gestureHint\": \"calm_nod\"}</sentiment>"
        ];
        
        const randomMock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        // Simulate streaming chunks
        const chunks = randomMock.split(' ');
        let currentText = '';
        
        for (const chunk of chunks) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Artificial stream delay
          currentText += chunk + ' ';
          
          const textMatch = currentText.match(/<text>([\s\S]*?)(?:<\/text>|$)/);
          if (textMatch) {
            const newText = textMatch[1];
            // If we completed a sentence, speak it
            const newWords = newText.substring(streamingText.length);
            if (/[.!?]/.test(newWords)) {
               const sentence = newWords.split(/[.!?]/)[0];
               speakText(sentence, params.personaId || 'harsha');
            }
            setStreamingText(newText);
          }
        }
        
        // Process final sentiment
        const sentimentMatch = currentText.match(/<sentiment>([\s\S]*?)<\/sentiment>/);
        if (sentimentMatch) {
          try {
            const metadata = JSON.parse(sentimentMatch[1]);
            const finalCommentary = {
              id: Date.now().toString(),
              text: currentText.replace(/<[^>]*>/g, '').trim(),
              timestamp: Date.now(),
              sentiment: metadata.sentiment > 0.7 ? 'excited' : metadata.sentiment < 0.4 ? 'disappointed' : 'neutral',
              metadata
            };
            addCommentary(finalCommentary as any);
          } catch (e) {
             console.error("Mock JSON Parse Error", e);
          }
        }
        setIsGenerating(false);
        return;
      }
      // --- END DEMO MODE ---

      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullBuffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  fullBuffer += data.text;
                  
                  // For the UI, we only show what's inside <text>
                  const textMatch = fullBuffer.match(/<text>([\s\S]*?)(?:<\/text>|$)/);
                  if (textMatch) {
                    const newText = textMatch[1];
                    // If we completed a sentence, speak it
                    const newWords = newText.substring(streamingText.length);
                    if (/[.!?]/.test(newWords)) {
                       const sentence = newWords.split(/[.!?]/)[0];
                       speakText(sentence, params.personaId || 'harsha');
                    }
                    setStreamingText(newText);
                  }
                }
              } catch (e) {
                // Ignore JSON parse errors on partial chunks
              }
            }
          }
        }
      }

      // Generation complete. Parse final metadata and save.
      let finalText = streamingText;
      let sentiment = 'neutral';
      
      const fullMatchText = fullBuffer.match(/<text>([\s\S]*?)<\/text>/);
      if (fullMatchText) finalText = fullMatchText[1].trim();

      const metaMatch = fullBuffer.match(/<metadata>(.*?)<\/metadata>/);
      if (metaMatch) {
        try {
          const meta = JSON.parse(metaMatch[1]);
          if (meta.sentiment) sentiment = meta.sentiment;
        } catch (e) {
          console.error("Failed to parse metadata", metaMatch[1]);
        }
      }

      // Add to store
      addCommentary({
        text: finalText,
        sentiment: sentiment as any,
        keywords: [],
        timestamp: new Date(),
        language: params.language || 'en',
      });

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn("Generation failed, using fallback:", err);
      
      // Fallback Logic
      const bank = FALLBACK_BANK[params.tone || 'excited'] || FALLBACK_BANK.neutral;
      const fallbackText = bank[Math.floor(Math.random() * bank.length)];
      
      // Simulate streaming for fallback to maintain UX
      let currentText = '';
      const words = fallbackText.split(' ');
      for (const word of words) {
        currentText += word + ' ';
        setStreamingText(currentText);
        await new Promise(r => setTimeout(r, 80)); // 80ms per word
      }

      addCommentary({
        text: fallbackText,
        sentiment: 'neutral',
        keywords: [],
        timestamp: new Date(),
        language: params.language || 'en',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStreamingText(''), 2000); // Clear after 2s
    }
  }, [isGenerating, commentaries, matchState, addCommentary]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  return {
    generateCommentary,
    cancelGeneration,
    isGenerating,
    streamingText
  };
}
