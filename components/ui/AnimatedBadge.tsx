'use client';

import React from 'react';
import { motion } from 'framer-motion';

type BadgeStatus = 'live' | 'active' | 'idle' | 'error';

interface AnimatedBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const statusConfig = {
  live: {
    bg: 'rgba(255, 0, 110, 0.15)',
    border: 'rgba(255, 0, 110, 0.4)',
    text: '#ff006e',
    dot: '#ff006e',
    label: 'LIVE',
  },
  active: {
    bg: 'rgba(0, 255, 136, 0.15)',
    border: 'rgba(0, 255, 136, 0.4)',
    text: '#00ff88',
    dot: '#00ff88',
    label: 'ACTIVE',
  },
  idle: {
    bg: 'rgba(255, 183, 3, 0.15)',
    border: 'rgba(255, 183, 3, 0.4)',
    text: '#ffb703',
    dot: '#ffb703',
    label: 'IDLE',
  },
  error: {
    bg: 'rgba(255, 59, 48, 0.15)',
    border: 'rgba(255, 59, 48, 0.4)',
    text: '#ff3b30',
    dot: '#ff3b30',
    label: 'ERROR',
  },
};

export default function AnimatedBadge({ status, label, className = '' }: AnimatedBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '9999px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        letterSpacing: 'var(--tracking-wider)',
        color: config.text,
        textTransform: 'uppercase',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Pulsing dot */}
      <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
        <motion.span
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: config.dot,
          }}
        />
        <span
          style={{
            position: 'relative',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: config.dot,
          }}
        />
      </span>
      {label || config.label}
    </motion.div>
  );
}
