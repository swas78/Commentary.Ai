'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard, NeonButton } from '@/components/ui';

export default function SharedClipPage({ params }: { params: { token: string } }) {
  // In a real implementation, this would fetch the clip URL and commentary text 
  // from the backend using the token.
  
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <Link href="/" className="text-xl font-black tracking-widest text-cyan-400 mb-10 hover:scale-105 transition-transform">
        🏏 COMMENTA.AI
      </Link>
      
      <GlassCard variant="glow" className="w-full max-w-2xl p-6 relative overflow-hidden group mb-8">
        {/* Decorative Border */}
        <div className="absolute inset-0 z-0 before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-[conic-gradient(from_0deg,#00d4ff,#ff006e,#00ff88,#00d4ff)] before:animate-[spin_4s_linear_infinite] before:opacity-30" />
        <div className="absolute inset-1 bg-[#0a0f1c]/95 rounded-2xl z-10 backdrop-blur-xl" />
        
        <div className="relative z-20 flex flex-col items-center">
          
          <div className="w-full flex justify-between items-center mb-4 px-2">
            <span className="text-white/50 text-xs font-bold tracking-widest uppercase">VIRAL MOMENT</span>
            <span className="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-1 rounded">#{params.token}</span>
          </div>

          {/* Video Player Placeholder */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 relative border border-white/10 group-hover:border-cyan-500/50 transition-colors">
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center pl-1">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </div>
          
          {/* Commentary Text */}
          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 mb-6 text-center">
             <p className="text-lg font-medium leading-relaxed italic text-white/90">
                <span className="text-pink-400 font-bold drop-shadow-[0_0_8px_rgba(255,0,110,0.8)]">WHAT A SHOT!</span> He's hit that with absolute power. A glorious <span className="text-pink-400 font-bold">SIX</span> straight over the bowler's head!
             </p>
          </div>

          {/* Share Buttons */}
          <div className="w-full grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/20 text-[#25D366] rounded-xl hover:bg-[#25D366]/30 transition-colors text-sm font-bold">
              WhatsApp
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-bold">
              Copy Link
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-xl hover:bg-[#1DA1F2]/30 transition-colors text-sm font-bold">
              Twitter
            </button>
          </div>
          
        </div>
      </GlassCard>

      <div className="text-center">
        <p className="text-white/40 text-sm mb-4">Want to generate your own AI commentary?</p>
        <Link href="/commentary">
          <NeonButton variant="primary" className="px-8 py-3">Try Commenta.AI Free</NeonButton>
        </Link>
      </div>

    </div>
  );
}
