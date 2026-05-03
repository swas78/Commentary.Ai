'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GlassCard, NeonButton, AnimatedBadge, GlassSlider, AnimatedSwitch, DeviceStatusCard } from '@/components/ui';
import { useCommentaryStore } from '@/store/useCommentaryStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useCommentary } from '@/lib/gemini';
import { useCrowdEngine } from '@/lib/crowdEngine';
import { useClipRecorder } from '@/lib/clipRecorder';
import LanguagePersonaSelector from '@/components/settings/LanguagePersonaSelector';
import SettingsModal from '@/components/settings/SettingsModal';
import { ThreeErrorBoundary } from '@/components/ThreeErrorBoundary';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Dynamic imports for 3D and Camera components (No SSR)
const AvatarScene = dynamic(() => import('@/components/avatar/AvatarScene'), { ssr: false });
const AudioVisualizer = dynamic(() => import('@/components/avatar/AudioVisualizer'), { ssr: false });
const CameraFeed = dynamic(() => import('@/components/commentary/CameraFeed'), { ssr: false });
const CommentaryFeed = dynamic(() => import('@/components/commentary/CommentaryFeed'), { ssr: false });
const LiveScorecard = dynamic(() => import('@/components/commentary/LiveScorecard'), { ssr: false });
const DeviceSyncScene = dynamic(() => import('@/components/sync/DeviceSyncScene'), { ssr: false });

export default function CommentaryStudio() {
  const { addCommentary } = useCommentaryStore();
  const { isLive, setLive, devices } = useSessionStore();
  const { generateCommentary, isGenerating, streamingText, cancelGeneration } = useCommentary();
  const { initEngine, stopEngine, volume: crowdVolume, setVolume: setCrowdVolume } = useCrowdEngine();
  const { startRecording, stopRecording, isRecording, clipUrl, shareToken, clearClip } = useClipRecorder();
  const [manualInput, setManualInput] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState<'camera' | 'avatar' | 'controls'>('avatar');
  const [showQR, setShowQR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('harsha');
  
  const roomCode = "X79P2";
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${roomCode}` : '';

  // Manual Trigger
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    addCommentary({
      id: Math.random().toString(36).substring(7),
      text: manualInput,
      sentiment: 'neutral',
      keywords: [],
      timestamp: new Date().toISOString(),
      language: 'en',
    });
    setManualInput('');
  };

  const exportPDF = async () => {
    const el = document.getElementById('commentary-feed-container');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#060913' });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`commentary_session_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
    }
  };

  const toggleLive = async () => {
    if (isLive) {
      setLive(false);
      cancelGeneration();
      stopEngine();
    } else {
      setLive(true);
      await initEngine(); // Start audio context on user gesture
      // Kick off an initial generation for demo purposes
      generateCommentary({ tone: 'excited', detectedAction: 'Match started! The bowler is running in.', personaId: selectedPersona });
    }
  };

  return (
    <div className="h-screen w-full bg-[#060913] text-white flex flex-col overflow-hidden">
      
      {/* ── Top Navigation Bar ── */}
      <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-widest text-cyan-400">🏏 CMNT.AI</Link>
          <div className="h-4 w-px bg-white/20 hidden md:block" />
          <AnimatedBadge label={isLive ? "LIVE BROADCAST" : "STUDIO STANDBY"} status={isLive ? "error" : "idle"} />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowQR(true)}
            className="text-white/50 text-sm font-medium hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            Room: <strong className="text-white tracking-widest">{roomCode}</strong>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </button>
          <div className="h-4 w-px bg-white/20 hidden md:block" />
          <Link href="/dashboard" className="text-white/50 text-sm hover:text-cyan-400 transition-colors">
            Analytics
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 p-[2px] ml-2">
            <div className="w-full h-full bg-[#0a0f1c] rounded-full border border-white/20" />
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="bg-[#0a0f1c] border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,212,255,0.2)] text-center relative max-w-sm" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-white/50 hover:text-white" onClick={() => setShowQR(false)}>✕</button>
            <h2 className="text-2xl font-black mb-2">SCAN TO JOIN</h2>
            <p className="text-white/50 text-sm mb-6">Pair your mobile device via WebRTC for multi-camera feeds and real-time audio sync.</p>
            <div className="bg-white p-4 rounded-xl inline-block mb-6">
              <QRCodeSVG value={joinUrl} size={200} />
            </div>
            <div className="text-3xl font-black tracking-[0.2em] text-cyan-400">{roomCode}</div>
          </div>
        </div>
      )}

      {/* ── Main Studio Grid (Desktop) ── */}
      <div className="flex-1 hidden md:grid grid-cols-[1fr_1.5fr_1fr] gap-4 p-4 overflow-hidden">
        
        {/* LEFT PANEL: Camera & AR */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <GlassCard variant="dark" className="p-4 flex flex-col gap-4 h-full relative">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider flex items-center justify-between">
              Camera Input <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/50">AR OVERLAY ON</span>
            </h3>
            
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/10 shrink-0">
              <CameraFeed isLive={isLive} />
            </div>
            
            {/* Live Scorecard Sync */}
            <div className="mt-2 flex-1 flex flex-col justify-end">
              <LiveScorecard />
            </div>
          </GlassCard>
        </div>

        {/* CENTER PANEL: Avatar & Commentary Feed */}
        <div className="flex flex-col gap-4 overflow-hidden h-full" id="commentary-feed-container">
          {/* Top Half: 3D Avatar Area */}
          <GlassCard variant="base" className="relative h-[35vh] shrink-0 overflow-hidden rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#0a0f1c] to-[#04060c]">
            {/* Audio Visualizer running in background */}
            <AudioVisualizer className="opacity-80" />
            
            {/* 3D Avatar */}
            <div className="absolute inset-0 z-10 pt-10">
              <ThreeErrorBoundary>
                <AvatarScene />
              </ThreeErrorBoundary>
            </div>

            {/* Gradient Mask for smooth blending */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060913] to-transparent z-20 pointer-events-none" />
            
            {/* Overlay Status */}
            <div className="absolute bottom-4 left-4 z-30">
              {isLive && <AnimatedBadge label="GENERATING AI..." status="active" className="animate-pulse shadow-[0_0_15px_rgba(255,183,3,0.5)]" />}
            </div>
          </GlassCard>

          {/* Bottom Half: Streaming Text Feed */}
          <GlassCard variant="dark" className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-white/60 tracking-wider">LIVE FEED</span>
              {isGenerating && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>}
            </div>
            
            {/* Real-time Streaming Area */}
            {streamingText && (
              <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-transparent border-b border-white/5">
                <p className="text-xl font-medium text-white/90 leading-relaxed italic">
                  <span className="text-cyan-400 mr-2 text-2xl">"</span>
                  {streamingText}
                  <span className="animate-pulse ml-1 inline-block w-2 h-5 bg-white/50 align-middle"></span>
                </p>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              <CommentaryFeed />
            </div>
          </GlassCard>
        </div>

        {/* RIGHT PANEL: Controls & Settings */}
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto no-scrollbar pb-4">
          
          {/* Main Action Area */}
          <GlassCard variant="glow" className="p-6 text-center shadow-[0_0_30px_rgba(0,212,255,0.1)]">
            <h2 className="text-2xl font-black mb-4">BROADCAST CONTROL</h2>
            <NeonButton 
              variant={isLive ? "danger" : "primary"} 
              className="w-full py-5 text-xl font-bold shadow-2xl"
              onClick={toggleLive}
            >
              {isLive ? "⏹ STOP RECORDING" : "▶ START COMMENTARY"}
            </NeonButton>
            <p className="text-white/40 text-xs mt-3">Activates Gemini Vision and Audio Systems</p>
          </GlassCard>

          {/* Settings Group */}
          <GlassCard variant="dark" className="p-5 flex flex-col gap-5 relative">
            <button 
              onClick={() => setShowSettings(true)}
              className="absolute top-4 right-4 text-white/40 hover:text-cyan-400 transition-colors"
              title="Global Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-white/80">AI Persona</span>
              </div>
              <LanguagePersonaSelector selectedId={selectedPersona} onSelect={setSelectedPersona} />
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-white/80 block">Crowd Atmosphere</span>
                <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded">TONE.JS</span>
              </div>
              <GlassSlider value={crowdVolume + 30} onChange={(val) => setCrowdVolume(val - 30)} min={0} max={40} />
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white/80 block">Auto-Commentary</span>
                <span className="text-[10px] text-white/40">Generate automatically from video</span>
              </div>
              <AnimatedSwitch checked={true} onChange={()=>{}} />
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link href="/battle" className="contents">
              <GlassCard variant="base" className="p-3 text-center cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-xl mb-1 block">⚔️</span>
                <span className="text-[10px] font-bold">Battle Mode</span>
              </GlassCard>
            </Link>
            
            <GlassCard 
              variant="base" 
              className={`p-3 text-center cursor-pointer transition-colors ${isRecording ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'hover:bg-white/10'}`}
              onClick={() => {
                if (isRecording) stopRecording();
                else startRecording('canvas'); // Assumes the R3F canvas is the first/only canvas
              }}
            >
              <span className={`text-xl mb-1 block ${isRecording ? 'animate-pulse' : ''}`}>🎥</span>
              <span className="text-[10px] font-bold">{isRecording ? 'Recording...' : 'Export Clip'}</span>
            </GlassCard>

            <GlassCard variant="base" className="p-3 text-center cursor-pointer hover:bg-white/10 transition-colors" onClick={exportPDF}>
              <span className="text-xl mb-1 block">📄</span>
              <span className="text-[10px] font-bold">Export PDF</span>
            </GlassCard>
          </div>

          {/* Clip Ready Modal */}
          {clipUrl && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={clearClip}>
              <div className="bg-[#0a0f1c] border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(255,0,110,0.2)] text-center relative max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black mb-2 text-pink-400">CLIP GENERATED!</h2>
                <p className="text-white/50 text-sm mb-4">Your 15-second viral moment is ready to share.</p>
                <video src={clipUrl} controls className="w-full aspect-video rounded-xl bg-black mb-4 border border-white/10" />
                <div className="flex gap-3">
                  <Link href={`/clips/${shareToken}`} className="flex-1">
                    <NeonButton variant="primary" className="w-full py-3">Share Online</NeonButton>
                  </Link>
                  <button onClick={clearClip} className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          <GlassCard variant="dark" className="p-4">
            <span className="text-xs font-bold text-white/60 tracking-wider mb-3 block">SYNCED DEVICES (3)</span>
            
            {/* 3D Network Visualization */}
            <div className="mb-4 rounded-xl overflow-hidden border border-white/5">
              <DeviceSyncScene />
            </div>

            <div className="flex flex-col gap-2">
              <DeviceStatusCard name="iPhone 15 Pro" type="mobile" status="connected" latency={12} />
              <DeviceStatusCard name="Studio Monitor" type="desktop" status="connected" latency={8} />
            </div>
          </GlassCard>

        </div>
      </div>

      {/* ── Mobile Layout Overlay (Only shows on small screens) ── */}
      <div className="md:hidden flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 p-4">
          {activeMobileTab === 'avatar' && (
            <div className="flex flex-col gap-4 h-full">
              <div className="h-1/2 relative rounded-xl overflow-hidden bg-[#0a0f1c]"><AudioVisualizer className="opacity-60"/><AvatarScene /></div>
              <div className="h-1/2 rounded-xl overflow-hidden bg-white/5 border border-white/10"><CommentaryFeed /></div>
            </div>
          )}
          {activeMobileTab === 'camera' && <CameraFeed isLive={isLive} />}
          {activeMobileTab === 'controls' && (
             <div className="flex flex-col gap-4">
               <NeonButton variant={isLive ? "danger" : "primary"} className="w-full py-4 text-lg" onClick={() => setLive(!isLive)}>
                 {isLive ? "STOP RECORDING" : "START COMMENTARY"}
               </NeonButton>
               <GlassCard variant="dark" className="p-4">Settings available on Desktop.</GlassCard>
             </div>
          )}
        </div>
        
        {/* Mobile Tab Bar */}
        <div className="absolute bottom-0 w-full h-16 bg-[#060913]/90 backdrop-blur-xl border-t border-white/10 flex">
          <button className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeMobileTab === 'camera' ? 'text-cyan-400' : 'text-white/40'}`} onClick={() => setActiveMobileTab('camera')}>
             <span className="text-lg">📷</span><span className="text-[10px] font-bold">CAMERA</span>
          </button>
          <button className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeMobileTab === 'avatar' ? 'text-pink-400' : 'text-white/40'}`} onClick={() => setActiveMobileTab('avatar')}>
             <span className="text-lg">🧑‍💼</span><span className="text-[10px] font-bold">STUDIO</span>
          </button>
          <button className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeMobileTab === 'controls' ? 'text-green-400' : 'text-white/40'}`} onClick={() => setActiveMobileTab('controls')}>
             <span className="text-lg">⚙️</span><span className="text-[10px] font-bold">CTRL</span>
          </button>
        </div>
      </div>
      
    </div>
  );
}
// Import Link properly
import Link from 'next/link';
