// @ts-nocheck
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAudioAnalyser } from './useAudioAnalyser';
import { NeonButton } from '@/components/ui';

interface AudioVisualizerProps {
  className?: string;
}

export default function AudioVisualizer({ className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { initAudio, getFrequencyData, getEnergyLevel, isInitialized } = useAudioAnalyser();
  const [needsInit, setNeedsInit] = useState(true);

  // SVG Energy Ring State (we handle this via DOM ref to avoid re-renders)
  const ringRef = useRef<SVGCircleElement>(null);
  const ringContainerRef = useRef<HTMLDivElement>(null);

  const handleStart = async () => {
    await initAudio();
    setNeedsInit(false);
  };

  useEffect(() => {
    if (needsInit || !isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let previousEnergy = 0;

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height * 0.7; // Position lower to arc behind avatar
      const radius = 200; // Radius of the arc

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const dataArray = getFrequencyData();
      const energy = getEnergyLevel();
      
      if (!dataArray) return;

      // 1. Draw Glow Background
      const glowRadius = radius + (energy * 150);
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, glowRadius);
      gradient.addColorStop(0, `rgba(0, 212, 255, ${energy * 0.4})`);
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 64-bar Semicircle Arc
      const barCount = dataArray.length; // 64
      const angleStep = Math.PI / (barCount - 1); // 180 degrees (Math.PI) distributed over 64 bars

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * 120; // Max height 120px
        
        // Map color based on frequency bin
        let r, g, b;
        if (i < 8) { // Lows: Pink/Red
          r = 255; g = 0; b = 110;
        } else if (i < 40) { // Mids: Cyan
          r = 0; g = 212; b = 255;
        } else { // Highs: Green
          r = 0; g = 255; b = 136;
        }

        const color = `rgb(${r}, ${g}, ${b})`;
        const angle = Math.PI + (i * angleStep); // Start from left (180deg) to right (0deg)
        
        // Start point of bar (on the radius)
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        
        // End point of bar (extending outward)
        const endX = centerX + Math.cos(angle) * (radius + barHeight);
        const endY = centerY + Math.sin(angle) * (radius + barHeight);

        // Draw main bar
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.stroke();

        // Draw mirrored bar (downward reflection)
        const mirrorEndY = centerY + Math.sin(angle) * (radius - (barHeight * 0.3)); // Mirror inward/downward
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(centerX + Math.cos(angle) * (radius - (barHeight * 0.3)), mirrorEndY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`; // 25% opacity
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      // 3. Update SVG Energy Ring DOM directly
      if (ringRef.current && ringContainerRef.current) {
        // Calculate circumference
        const r = 240;
        const circ = 2 * Math.PI * r;
        const offset = circ - (energy * circ);
        
        ringRef.current.style.strokeDashoffset = String(offset);
        
        // Color mapping for SVG ring
        let ringColor = '#00d4ff'; // Cyan
        if (energy > 0.7) ringColor = '#ff006e'; // Red
        else if (energy > 0.4) ringColor = '#ffb703'; // Pink/Warning
        
        ringRef.current.style.stroke = ringColor;
        ringRef.current.style.filter = `drop-shadow(0 0 10px ${ringColor})`;

        // Beat detection: rapid increase in energy
        if (energy > 0.6 && (energy - previousEnergy) > 0.1) {
           ringContainerRef.current.style.transform = 'scale(1.05)';
        } else {
           ringContainerRef.current.style.transform = 'scale(1)';
        }
      }

      previousEnergy = energy;
    };

    renderFrame();

    return () => cancelAnimationFrame(animationRef.current);
  }, [isInitialized, getFrequencyData, getEnergyLevel]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`absolute inset-0 flex items-center justify-center overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      {needsInit ? (
        <div className="absolute z-10 flex flex-col items-center gap-4 bg-black/40 p-8 rounded-2xl backdrop-blur-md border border-white/10">
          <p className="text-white/70 text-sm">Web Audio API requires interaction</p>
          <NeonButton onClick={handleStart} variant="primary">Start Audio Visualizer</NeonButton>
        </div>
      ) : null}
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Energy Meter Overlay */}
      <div 
        ref={ringContainerRef}
        className="absolute transition-transform duration-100 pointer-events-none"
        style={{ width: 500, height: 500 }}
      >
        <svg width="500" height="500" className="-rotate-90">
          <circle 
            cx="250" cy="250" r="240" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="4" 
            fill="none" 
          />
          <circle 
            ref={ringRef}
            cx="250" cy="250" r="240" 
            stroke="#00d4ff" 
            strokeWidth="6" 
            fill="none" 
            strokeLinecap="round"
            style={{
              strokeDasharray: 2 * Math.PI * 240,
              strokeDashoffset: 2 * Math.PI * 240,
              transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s'
            }}
          />
        </svg>
      </div>
    </div>
  );
}
