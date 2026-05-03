'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GlassCard, AnimatedBadge, GlowText, NeonButton } from '@/components/ui';

interface CameraFeedProps {
  onFrameCapture?: (base64Image: string) => void;
  isLive?: boolean;
}

export default function CameraFeed({ onFrameCapture, isLive = false }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Default to true if no camera

  // Request camera stream
  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, facingMode: 'environment' },
          audio: false, // Don't want feedback loops
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
          setDemoMode(false);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable, falling back to simulated feed.', err);
        setDemoMode(true);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Frame Capture Loop
  useEffect(() => {
    if (!isLive || !onFrameCapture || demoMode) return;
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        // Just for capturing, we'd draw video to an offscreen canvas.
        // For simplicity here, we'll assume the frame is captured.
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 640; tempCanvas.height = 360;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 360);
          onFrameCapture(tempCanvas.toDataURL('image/jpeg', 0.7));
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isLive, onFrameCapture, demoMode]);

  // AR Overlay Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const renderAR = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const w = canvas.width;
      const h = canvas.height;

      // Simulated Batsman Box
      const batX = w * 0.4 + Math.sin(time) * 20;
      const batY = h * 0.5 + Math.cos(time * 0.5) * 10;
      const batW = w * 0.15;
      const batH = h * 0.4;

      // Draw Glowing Box
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00d4ff';
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(batX, batY, batW, batH);

      // Label Chip
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 22, 41, 0.8)';
      ctx.fillRect(batX, batY - 30, 120, 24);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter';
      ctx.fillText('BATSMAN (84%)', batX + 10, batY - 14);

      // Simulated Ball Trajectory
      const ballX = w * 0.8 - (time * 50) % (w * 0.6); // Moves right to left
      const ballY = h * 0.7 - Math.abs(Math.sin(time * 2)) * 100; // Bouncing

      ctx.beginPath();
      ctx.moveTo(w * 0.8, h * 0.7);
      // Quadratic bezier for simple trajectory
      ctx.quadraticCurveTo(w * 0.6, h * 0.2, ballX, ballY);
      
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -time * 20;
      ctx.strokeStyle = '#ff006e';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff006e';
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Ball Orb
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();

      animationId = requestAnimationFrame(renderAR);
    };

    // Resize canvas to match container
    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    renderAR();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <GlassCard variant="base" className="relative w-full aspect-video overflow-hidden group">
      {/* Video Stream or Demo Background */}
      {demoMode ? (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center opacity-50">
            <span className="text-4xl block mb-4">🏟️</span>
            <GlowText>Simulated Camera Feed</GlowText>
          </div>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
        />
      )}

      {/* AR Overlay Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Top Left Indicators */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <AnimatedBadge 
          label={isLive ? "LIVE RECORDING" : "STANDBY"} 
          status={isLive ? "live" : "idle"}
        />
        {demoMode && <AnimatedBadge label="DEMO MODE" status="active" />}
      </div>

      {/* Top Right Score Overlay */}
      <div className="absolute top-4 right-4 z-20">
        <div className="glass-dark p-3 rounded-xl border border-white/10 backdrop-blur-md w-48 shadow-xl">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/70 text-xs font-semibold">IND vs AUS</span>
            <span className="text-cyan-400 font-bold text-lg">184/3</span>
          </div>
          <div className="h-px bg-white/10 w-full mb-2" />
          <div className="flex justify-between text-xs text-white/80">
            <span>Overs: <strong className="text-white">16.4</strong></span>
            <span>CRR: <strong className="text-white">11.2</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Controls (Visible on Hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
        </div>
        <NeonButton 
          variant={demoMode ? "ghost" : "primary"} 
          onClick={() => setDemoMode(!demoMode)}
          className="text-xs py-1.5 px-3"
        >
          {demoMode ? "Enable Camera" : "Enable Demo"}
        </NeonButton>
      </div>
    </GlassCard>
  );
}
