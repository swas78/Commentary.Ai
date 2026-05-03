'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GlassCard, NeonButton } from '@/components/ui';

// No SSR for the 3D canvas
const AvatarScene = dynamic(() => import('@/components/avatar/AvatarScene'), { ssr: false });

export default function BattleMode() {
  const [battleActive, setBattleActive] = useState(false);
  const [roundTimer, setRoundTimer] = useState(60);
  const [votes, setVotes] = useState({ a: 50, b: 50 }); // percentages
  
  // Simulated streaming text for battle mode demonstration
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const fullTextA = "What a magnificent shot by Kohli! The sheer elegance of that cover drive shows why he is the absolute king of this format. The bowler had no chance!";
  const fullTextB = "Oh come on, that was a terrible delivery! Short and wide, begging to be hit. Any club cricketer would have put that away for four. The bowling is collapsing!";

  useEffect(() => {
    if (!battleActive) return;

    let idx = 0;
    setTextA('');
    setTextB('');

    const interval = setInterval(() => {
      if (idx < Math.max(fullTextA.length, fullTextB.length)) {
        if (idx < fullTextA.length) setTextA(prev => prev + fullTextA[idx]);
        if (idx < fullTextB.length) setTextB(prev => prev + fullTextB[idx]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [battleActive]);

  useEffect(() => {
    if (battleActive && roundTimer > 0) {
      const t = setTimeout(() => setRoundTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    } else if (roundTimer === 0) {
      setBattleActive(false);
    }
  }, [battleActive, roundTimer]);

  const handleVote = (team: 'a' | 'b') => {
    if (team === 'a') setVotes(v => ({ a: Math.min(90, v.a + 5), b: Math.max(10, v.b - 5) }));
    else setVotes(v => ({ a: Math.max(10, v.a - 5), b: Math.min(90, v.b + 5) }));
  };

  return (
    <div className="h-screen w-full bg-[#060913] text-white flex flex-col overflow-hidden relative">
      
      {/* HEADER */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/commentary" className="text-white/50 hover:text-white transition-colors">← Back to Studio</Link>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
            BATTLE MODE ⚔️
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-bold text-white/50">ROUND 1/10</span>
          <div className="text-2xl font-black font-mono w-16 text-center">{roundTimer}s</div>
          <NeonButton 
            variant={battleActive ? "danger" : "primary"} 
            onClick={() => {
              setBattleActive(!battleActive);
              if (!battleActive) setRoundTimer(60);
            }}
          >
            {battleActive ? 'END ROUND' : 'START BATTLE'}
          </NeonButton>
        </div>
      </header>

      {/* SPLIT SCREEN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* TEAM A (LEFT) */}
        <div className="flex-1 border-r border-white/10 flex flex-col relative overflow-hidden bg-gradient-to-br from-cyan-900/20 to-transparent">
          {/* Avatar Canvas */}
          <div className="h-[60%] relative">
             <AvatarScene />
             <div className="absolute top-4 left-4 bg-cyan-500 text-black text-xs font-black px-3 py-1 uppercase tracking-widest rounded-sm transform -skew-x-12">
               Team India Fan
             </div>
          </div>
          
          {/* Commentary Streaming */}
          <div className="flex-1 p-8 bg-black/40 border-t border-cyan-500/30 flex flex-col justify-end">
            <h3 className="text-cyan-400 font-bold mb-2">HARSHA (EN)</h3>
            <p className="text-2xl font-medium leading-relaxed italic text-white/90">
              <span className="text-cyan-400 text-3xl">"</span>
              {textA}
              {battleActive && <span className="animate-pulse ml-1 inline-block w-2 h-6 bg-cyan-400 align-middle"></span>}
            </p>
          </div>
        </div>

        {/* VS DIVIDER */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-black border-4 border-[#060913] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            <span className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-pink-500">VS</span>
          </div>
        </div>

        {/* TEAM B (RIGHT) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-bl from-pink-900/20 to-transparent">
          {/* Avatar Canvas */}
          <div className="h-[60%] relative">
             <AvatarScene />
             <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded-sm transform skew-x-12">
               Team Aus Fan
             </div>
          </div>

          {/* Commentary Streaming */}
          <div className="flex-1 p-8 bg-black/40 border-t border-pink-500/30 flex flex-col justify-end items-end text-right">
            <h3 className="text-pink-400 font-bold mb-2">SUNDAR (TA)</h3>
            <p className="text-2xl font-medium leading-relaxed italic text-white/90">
              {textB}
              {battleActive && <span className="animate-pulse ml-1 inline-block w-2 h-6 bg-pink-400 align-middle"></span>}
              <span className="text-pink-400 text-3xl ml-2">"</span>
            </p>
          </div>
        </div>
      </div>

      {/* VOTING BAR (BOTTOM) */}
      <div className="h-24 bg-[#0a0f1c] border-t border-white/10 shrink-0 p-4 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2 px-4">
          <button onClick={() => handleVote('a')} className="text-cyan-400 text-sm font-bold hover:scale-105 transition-transform uppercase tracking-wider flex items-center gap-2">
             <span className="text-xl">👍</span> Vote Harsha
          </button>
          <span className="text-white/30 text-xs font-bold tracking-widest">LIVE AUDIENCE VOTE</span>
          <button onClick={() => handleVote('b')} className="text-pink-400 text-sm font-bold hover:scale-105 transition-transform uppercase tracking-wider flex items-center gap-2">
             Vote Sundar <span className="text-xl">👍</span>
          </button>
        </div>
        
        {/* Vote Meter */}
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: `${votes.a}%` }} />
          <div className="h-full bg-gradient-to-l from-pink-600 to-pink-400 transition-all duration-500" style={{ width: `${votes.b}%` }} />
        </div>
        <div className="flex justify-between px-2 mt-1">
          <span className="text-[10px] font-bold text-cyan-400">{votes.a}%</span>
          <span className="text-[10px] font-bold text-pink-400">{votes.b}%</span>
        </div>
      </div>

    </div>
  );
}
