'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type GlassVariant = 'base' | 'glow' | 'dark' | 'frosted';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: GlassVariant;
  glowColor?: 'cyan' | 'pink' | 'green' | 'warning' | 'success';
  blurIntensity?: 'light' | 'normal' | 'heavy';
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
}

const glowColorMap = {
  cyan: {
    border: 'rgba(0, 212, 255, 0.15)',
    borderHover: 'rgba(0, 212, 255, 0.3)',
    shadow: '0 0 15px rgba(0, 212, 255, 0.15), 0 0 30px rgba(0, 212, 255, 0.05)',
    shadowHover: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.1)',
  },
  pink: {
    border: 'rgba(255, 0, 110, 0.15)',
    borderHover: 'rgba(255, 0, 110, 0.3)',
    shadow: '0 0 15px rgba(255, 0, 110, 0.15), 0 0 30px rgba(255, 0, 110, 0.05)',
    shadowHover: '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(255, 0, 110, 0.1)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.15)',
    borderHover: 'rgba(0, 255, 136, 0.3)',
    shadow: '0 0 15px rgba(0, 255, 136, 0.15), 0 0 30px rgba(0, 255, 136, 0.05)',
    shadowHover: '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.1)',
  },
  warning: {
    border: 'rgba(255, 183, 3, 0.15)',
    borderHover: 'rgba(255, 183, 3, 0.3)',
    shadow: '0 0 15px rgba(255, 183, 3, 0.15), 0 0 30px rgba(255, 183, 3, 0.05)',
    shadowHover: '0 0 20px rgba(255, 183, 3, 0.4), 0 0 40px rgba(255, 183, 3, 0.1)',
  },
  success: {
    border: 'rgba(6, 255, 165, 0.15)',
    borderHover: 'rgba(6, 255, 165, 0.3)',
    shadow: '0 0 15px rgba(6, 255, 165, 0.15), 0 0 30px rgba(6, 255, 165, 0.05)',
    shadowHover: '0 0 20px rgba(6, 255, 165, 0.4), 0 0 40px rgba(6, 255, 165, 0.1)',
  },
};

const blurMap = {
  light: '6px',
  normal: '12px',
  heavy: '24px',
};

const variantStyles: Record<GlassVariant, React.CSSProperties> = {
  base: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  glow: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.15)',
  },
  dark: {
    background: 'rgba(10, 14, 26, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  frosted: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

export default function GlassCard({
  variant = 'base',
  glowColor = 'cyan',
  blurIntensity = 'normal',
  children,
  className = '',
  hoverScale = true,
  style,
  ...motionProps
}: GlassCardProps) {
  const glow = glowColorMap[glowColor];
  const blur = blurMap[blurIntensity];
  const isGlow = variant === 'glow';
  const isFrosted = variant === 'frosted';

  return (
    <motion.div
      className={`${className}`}
      style={{
        ...variantStyles[variant],
        backdropFilter: `blur(${blur})${isFrosted ? ' saturate(1.8)' : ''}`,
        WebkitBackdropFilter: `blur(${blur})${isFrosted ? ' saturate(1.8)' : ''}`,
        borderRadius: '16px',
        boxShadow: isGlow ? glow.shadow : isFrosted ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
      whileHover={hoverScale ? {
        scale: 1.02,
        borderColor: isGlow ? glow.borderHover : 'rgba(255,255,255,0.15)',
        boxShadow: isGlow ? glow.shadowHover : undefined,
      } : undefined}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
