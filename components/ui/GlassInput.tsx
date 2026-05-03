'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  glowColor?: 'cyan' | 'pink' | 'green';
  onChange?: (value: string) => void;
}

const glowMap = {
  cyan: {
    border: 'rgba(0, 212, 255, 0.5)',
    shadow: '0 0 15px rgba(0, 212, 255, 0.2), 0 0 30px rgba(0, 212, 255, 0.05)',
  },
  pink: {
    border: 'rgba(255, 0, 110, 0.5)',
    shadow: '0 0 15px rgba(255, 0, 110, 0.2), 0 0 30px rgba(255, 0, 110, 0.05)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.5)',
    shadow: '0 0 15px rgba(0, 255, 136, 0.2), 0 0 30px rgba(0, 255, 136, 0.05)',
  },
};

export default function GlassInput({
  label,
  error,
  icon,
  glowColor = 'cyan',
  className = '',
  onChange,
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const glow = glowMap[glowColor];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'rgba(226, 232, 240, 0.7)',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          {label}
        </label>
      )}
      <motion.div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
        animate={{
          boxShadow: isFocused ? glow.shadow : 'none',
        }}
        transition={{ duration: 0.25 }}
      >
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: isFocused ? 'var(--color-accent-primary)' : 'rgba(226, 232, 240, 0.4)',
              transition: 'color 250ms',
              zIndex: 1,
              display: 'flex',
            }}
          >
            {icon}
          </span>
        )}
        <motion.input
          {...props}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            borderColor: error
              ? 'rgba(255, 0, 110, 0.5)'
              : isFocused
                ? glow.border
                : 'rgba(255, 255, 255, 0.08)',
          }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            padding: icon ? '12px 16px 12px 44px' : '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            color: '#e2e8f0',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            transition: 'background 250ms',
          }}
        />
      </motion.div>
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-secondary)' }}
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}
