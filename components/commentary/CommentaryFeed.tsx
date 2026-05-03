'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommentaryStore } from '@/store/useCommentaryStore';

// Helper to format keywords with glowing spans
const formatCommentaryText = (text: string) => {
  const words = text.split(' ');
  return words.map((word, i) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    let glowClass = '';
    if (['SIX', 'FOUR', 'OUT', 'WICKET', 'BOUNDARY'].includes(cleanWord)) {
      glowClass = 'text-pink-400 drop-shadow-[0_0_8px_rgba(255,0,110,0.8)] font-bold scale-105 inline-block';
    } else if (['KOHLI', 'ROHIT', 'DHONI', 'SMITH', 'CUMMINS'].includes(cleanWord)) { // Dummy names
      glowClass = 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)] font-bold';
    } else if (/\d+/.test(cleanWord)) { // Numbers/Stats
      glowClass = 'text-green-400 drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]';
    }

    return (
      <span key={i} className={glowClass}>
        {word}{' '}
      </span>
    );
  });
};

export default function CommentaryFeed() {
  const commentaries = useCommentaryStore(s => s.commentaries);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commentaries]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Filter Bar */}
      <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5 shrink-0">
        <button className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(0,212,255,0.2)]">All Events</button>
        <button className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium border border-white/10 transition-colors whitespace-nowrap">Boundaries</button>
        <button className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium border border-white/10 transition-colors whitespace-nowrap">Wickets</button>
        <button className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium border border-white/10 transition-colors whitespace-nowrap">Milestones</button>
      </div>

      {/* Feed Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth flex flex-col-reverse"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {commentaries.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-base p-4 rounded-xl border border-white/10 relative overflow-hidden group"
            >
              {/* Highlight accent based on sentiment */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  item.sentiment === 'excited' ? 'bg-pink-500 shadow-[0_0_10px_#ff006e]' :
                  item.sentiment === 'disappointed' ? 'bg-blue-500 shadow-[0_0_10px_#0044ff]' :
                  'bg-cyan-500 shadow-[0_0_10px_#00d4ff]'
                }`}
              />

              {/* Header */}
              <div className="flex justify-between items-center mb-2 pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    AI
                  </div>
                  <span className="text-white/90 font-semibold text-sm">Gemini Comm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60 uppercase">{item.language}</span>
                </div>
              </div>

              {/* Body */}
              <div className="pl-2 text-[15px] leading-relaxed text-white/85">
                {formatCommentaryText(item.text)}
              </div>

              {/* Footer / Actions (Reveal on hover) */}
              <div className="pl-2 mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button className="text-lg hover:scale-110 transition-transform">🔥</button>
                  <button className="text-lg hover:scale-110 transition-transform">👏</button>
                  <button className="text-lg hover:scale-110 transition-transform">😮</button>
                </div>
                <div className="flex gap-2">
                  <button className="text-white/50 hover:text-white transition-colors text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                  <button className="text-white/50 hover:text-white transition-colors text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {commentaries.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm">
            <span className="text-4xl mb-3 opacity-50">🎙️</span>
            Waiting for live action...
          </div>
        )}
      </div>
    </div>
  );
}
