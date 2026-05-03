'use client';

import React from 'react';

type GlowColor = 'cyan' | 'green' | 'red' | 'blue';

interface GlowTextProps {
  children: React.ReactNode;
  color?: GlowColor;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
}

const colorMap: Record<GlowColor, { text: string; glow: string }> = {
  cyan: {
    text: '#00d4ff',
    glow: '0 0 10px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)',
  },
  green: {
    text: '#00ff88',
    glow: '0 0 10px rgba(0,255,136,0.3), 0 0 20px rgba(0,255,136,0.1)',
  },
  red: {
    text: '#ff006e',
    glow: '0 0 10px rgba(255,0,110,0.3), 0 0 20px rgba(255,0,110,0.1)',
  },
  blue: {
    text: '#4d9fff',
    glow: '0 0 10px rgba(77,159,255,0.3), 0 0 20px rgba(77,159,255,0.1)',
  },
};

export default function GlowText({ children, color = 'cyan', as: Tag = 'span', className = '' }: GlowTextProps) {
  const c = colorMap[color];
  return (
    <Tag className={className} style={{ color: c.text, textShadow: c.glow }}>
      {children}
    </Tag>
  );
}
