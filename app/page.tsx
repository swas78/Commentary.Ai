'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GlassCard, NeonButton, GlowText } from '@/components/ui';

const HeroBackground = dynamic(() => import('@/components/3d/HeroBackground'), { ssr: false });

const features = [
  { title: 'AI Commentary Generation', desc: 'Gemini-powered real-time cricket commentary with deep match context and sentiment analysis.', icon: '🎙️', highlight: false },
  { title: '3D Commentator Avatar', desc: 'Lip-synced, gesture-responsive 3D avatar reacting dynamically to match events in real-time.', icon: '🧑‍💼', highlight: false },
  { title: 'Multi-Device Sync', desc: 'Connect phones, tablets, and desktops simultaneously with sub-10ms synchronization.', icon: '📱', highlight: false },
  { title: 'Commentary Battle Mode', desc: 'Pit two AI commentators against each other (e.g., Bias vs Neutral) for ultimate entertainment.', icon: '⚔️', highlight: true },
  { title: 'AR Camera Overlays', desc: 'Simulated computer vision bounding boxes and shot tracking direct on your live video feed.', icon: '🎯', highlight: false },
  { title: 'Shareable Clip Export', desc: 'Automatically generate short 15s highlight reels of key wickets or boundaries to share instantly.', icon: '🎥', highlight: false },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden">
      <HeroBackground />
      
      {/* ── 1. HERO SECTION ── */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10">
        <GlassCard variant="glow" className="max-w-4xl p-10 relative overflow-hidden group">
          {/* Animated Border */}
          <div className="absolute inset-0 z-0 before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-[conic-gradient(from_0deg,#00d4ff,#ff006e,#00ff88,#00d4ff)] before:animate-[spin_3s_linear_infinite] before:opacity-50" />
          <div className="absolute inset-1 bg-[#0a0f1c]/95 rounded-2xl z-10 backdrop-blur-xl" />

          <div className="relative z-20 flex flex-col items-center">
            {/* Logo */}
            <h2 className="text-xl font-bold tracking-[0.2em] mb-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]" style={{ transform: 'perspective(500px) rotateX(10deg)' }}>
              🏏 COMMENTA.AI
            </h2>

            {/* Staggered Headline Reveal (CSS alternative to framer-motion stagger for SSR safety) */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
              {['L','I','V','E'].map((c, i) => <span key={`l-${i}`} className="inline-block animate-[floatUp_0.5s_ease-out_forwards]" style={{ animationDelay: `${i*0.05}s`, opacity: 0, transform: 'translateY(20px)' }}>{c}</span>)}
              &nbsp;
              {['C','O','M','M','E','N','T','A','R','Y'].map((c, i) => <span key={`c-${i}`} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-[floatUp_0.5s_ease-out_forwards]" style={{ animationDelay: `${(i+4)*0.05}s`, opacity: 0, transform: 'translateY(20px)' }}>{c}</span>)}
              <br />
              {['U','N','L','E','A','S','H','E','D'].map((c, i) => <span key={`u-${i}`} className="inline-block animate-[floatUp_0.5s_ease-out_forwards]" style={{ animationDelay: `${(i+14)*0.05}s`, opacity: 0, transform: 'translateY(20px)' }}>{c}</span>)}
            </h1>

            {/* Subheading */}
            <p className="text-xl text-white/70 mb-10 max-w-2xl font-light">
              Transform your local gully cricket matches into international broadcasts with <GlowText>Gemini 2.0</GlowText> real-time intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="block w-full sm:w-auto">
                <NeonButton onClick={() => router.push('/commentary')} variant="primary" className="w-full text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8">
                  Start Live Session
                </NeonButton>
              </div>
              <div className="block w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4">
                <NeonButton onClick={() => router.push('/commentary?demo=true')} variant="ghost" className="w-full text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 flex items-center justify-center gap-2">
                  <span className="text-cyan-400">▶</span> Watch Demo
                </NeonButton>
              </div>
              <div className="block w-full sm:w-auto mt-4 sm:mt-0">
                <NeonButton onClick={() => router.push('/dashboard')} variant="danger" className="text-lg px-8 py-4 opacity-90">Try Battle Mode ⚔️</NeonButton>
              </div>
            </div>

            {/* Device Sync Indicator */}
            <div className="flex items-center gap-3 text-sm text-white/50 font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Syncing across <strong className="text-white">3 devices</strong> right now
            </div>
          </div>
        </GlassCard>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce text-white/30 text-2xl">↓</div>
      </section>

      {/* ── 2. STATS ROW ── */}
      <section className="py-20 px-6 relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="base" className="p-8 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-5xl font-black text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">{'<'}10ms</div>
            <div className="text-white/60 font-semibold tracking-widest uppercase text-sm">Socket Latency</div>
          </GlassCard>
          <GlassCard variant="base" className="p-8 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">🎥</div>
            <div className="text-5xl font-black text-pink-400 mb-2 drop-shadow-[0_0_10px_rgba(255,0,110,0.5)]">1080p</div>
            <div className="text-white/60 font-semibold tracking-widest uppercase text-sm">WebRTC Quality</div>
          </GlassCard>
          <GlassCard variant="base" className="p-8 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-4">📱</div>
            <div className="text-5xl font-black text-green-400 mb-2 drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">22+</div>
            <div className="text-white/60 font-semibold tracking-widest uppercase text-sm">Connected Devices</div>
          </GlassCard>
        </div>
      </section>

      {/* ── 4. WAVE SEPARATOR ── */}
      <div className="w-full h-24 bg-gradient-to-b from-transparent to-[#0a0f1c]" style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)' }} />

      {/* ── 3. FEATURES SECTION ── */}
      <section className="py-24 px-6 bg-[#0a0f1c] relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16 tracking-tight">POWERED BY <GlowText>NEXT-GEN AI</GlowText></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <GlassCard 
                key={i} 
                variant="base" 
                className={`p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,212,255,0.15)] ${feat.highlight ? 'border-pink-500/50 shadow-[0_0_20px_rgba(255,0,110,0.1)]' : ''}`}
              >
                <div className="text-4xl mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10">{feat.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${feat.highlight ? 'text-pink-400' : 'text-white'}`}>{feat.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{feat.desc}</p>
                {feat.highlight && <div className="mt-4 text-xs font-bold text-pink-500 uppercase tracking-wider">Most Popular 🔥</div>}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FOOTER ── */}
      <footer className="py-12 border-t border-white/10 bg-[#060913] text-center relative z-10">
        <p className="text-white/40 text-sm font-medium">Built with Next.js 14, R3F, and Gemini 2.0</p>
        <div className="mt-4 flex justify-center gap-4 text-white/30 text-xs">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>GitHub</span>
        </div>
      </footer>
      
      {/* Basic Keyframes for non-framer animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
