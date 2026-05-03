'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

// Simulated match progression logic
const STARTING_STATE = {
  teamA: 'IND', teamB: 'AUS',
  score: '184/3', overs: '16.4', runRate: '11.04',
  batsman1: { name: 'V. Kohli', runs: 67, balls: 45 },
  batsman2: { name: 'S. Yadav', runs: 42, balls: 21 },
  bowler: { name: 'P. Cummins', overs: '3.4', wickets: 1, runs: 32 },
  recentBalls: ['1', '0', '4', '1', 'W', '6'] as any[],
  partnership: { runs: 58, balls: 28 }
};

export default function LiveScorecard() {
  const { matchState, setMatchState, isLive } = useSessionStore();
  const [syncing, setSyncing] = useState(true);

  // Initial load
  useEffect(() => {
    setMatchState(STARTING_STATE);
    const t = setTimeout(() => setSyncing(false), 1500);
    return () => clearTimeout(t);
  }, [setMatchState]);

  // Simulate live match progression every 15 seconds if recording is active
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      const outcomes = ['0', '1', '2', '4', '6', 'W'];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      setMatchState(prev => {
        if (!prev) return prev;
        
        // Parse current score
        let [runs, wkts] = (prev.score || '184/3').split('/').map(Number);
        let [ovr, balls] = (prev.overs || '16.4').split('.').map(Number);
        
        // Update logic
        if (outcome === 'W') wkts++;
        else runs += Number(outcome);
        
        balls++;
        if (balls === 6) { ovr++; balls = 0; }
        
        const newScore = `${runs}/${wkts}`;
        const newOvers = `${ovr}.${balls}`;
        const newRecent = [...(prev.recentBalls || []).slice(1), outcome];
        
        return {
          ...prev,
          score: newScore,
          overs: newOvers,
          recentBalls: newRecent as any
        };
      });
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isLive, setMatchState]);

  if (!matchState?.score) return null;

  return (
    <div className="w-full bg-[#0a0f1c]/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="bg-white/5 px-4 py-2 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          {syncing ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          ) : (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
          <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
            {syncing ? 'SYNCING API...' : 'LIVE MATCH SYNCED'}
          </span>
        </div>
        <select className="bg-transparent text-xs text-cyan-400 font-bold outline-none cursor-pointer">
          <option>IND vs AUS - T20 World Cup</option>
          <option>ENG vs SA - Test Series</option>
        </select>
      </div>

      <div className="p-4">
        {/* Main Score Area */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex gap-3 text-sm font-black text-white/80 mb-1">
              <span className="text-white">{matchState.teamA}</span>
              <span className="text-white/30">vs</span>
              <span>{matchState.teamB}</span>
            </div>
            <div className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
              {matchState.score}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1">Overs</div>
            <div className="text-2xl font-black text-white">{matchState.overs}</div>
            <div className="text-xs text-white/40 mt-1 font-mono">CRR: {matchState.runRate}</div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />

        {/* Players Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Batting</div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-white font-bold flex items-center gap-1">
                {matchState.batsman1?.name} <span className="text-[10px] text-pink-400">★</span>
              </span>
              <span className="text-sm font-mono text-cyan-400">{matchState.batsman1?.runs}<span className="text-white/40 text-[10px]">({matchState.batsman1?.balls})</span></span>
            </div>
            <div className="flex justify-between items-center opacity-50">
              <span className="text-sm text-white font-medium">{matchState.batsman2?.name}</span>
              <span className="text-sm font-mono text-cyan-400">{matchState.batsman2?.runs}<span className="text-white/40 text-[10px]">({matchState.batsman2?.balls})</span></span>
            </div>
          </div>
          <div className="border-l border-white/5 pl-4">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Bowling</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white font-bold">{matchState.bowler?.name}</span>
            </div>
            <div className="text-xs font-mono text-white/70 mt-1">
              {matchState.bowler?.overs} - {matchState.bowler?.runs}/{matchState.bowler?.wickets}
            </div>
          </div>
        </div>

        {/* Recent Balls Ticker */}
        <div className="mt-4 bg-black/40 rounded-lg p-2 flex items-center gap-2 overflow-x-hidden">
          <span className="text-[10px] font-bold text-white/40 tracking-wider">RECENT</span>
          <div className="flex gap-1.5">
            {matchState.recentBalls?.map((ball, i) => {
              let color = 'bg-white/10 text-white/60';
              if (ball === 'W') color = 'bg-red-500 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]';
              else if (ball === '4') color = 'bg-cyan-500 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]';
              else if (ball === '6') color = 'bg-pink-500 text-white font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)]';
              
              return (
                <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${color} transition-all duration-300 transform hover:scale-110`}>
                  {ball}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
