'use client';

import React, { useState } from 'react';

interface GlassSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  glowColor?: string;
  className?: string;
}

export default function GlassSlider({
  min = 0, max = 100, step = 1, value: controlledValue,
  onChange, label, glowColor = '#00d4ff', className = '',
}: GlassSliderProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? 50);
  const val = controlledValue ?? internalValue;
  const pct = ((val - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInternalValue(v);
    onChange?.(v);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'rgba(226,232,240,0.7)' }}>
          <span>{label}</span>
          <span style={{ color: glowColor, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>
        </div>
      )}
      <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute', width: '100%', height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
        }} />
        {/* Active track */}
        <div style={{
          position: 'absolute', width: `${pct}%`, height: 6, borderRadius: 3,
          background: `linear-gradient(90deg, ${glowColor}88, ${glowColor})`,
          boxShadow: `0 0 10px ${glowColor}40`,
          transition: 'width 100ms',
        }} />
        {/* Native input */}
        <input
          type="range" min={min} max={max} step={step} value={val}
          onChange={handleChange}
          style={{
            position: 'relative', width: '100%', height: 24,
            appearance: 'none', WebkitAppearance: 'none', background: 'transparent',
            cursor: 'pointer', zIndex: 2,
          }}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 18px; height: 18px;
            border-radius: 50%; background: ${glowColor};
            box-shadow: 0 0 12px ${glowColor}80, 0 0 4px ${glowColor};
            border: 2px solid rgba(255,255,255,0.2);
            transition: transform 150ms ease, box-shadow 150ms ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 20px ${glowColor}aa, 0 0 6px ${glowColor};
          }
        `}</style>
      </div>
    </div>
  );
}
