'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantConfig = {
  primary: {
    gradient: 'linear-gradient(135deg, #00d4ff, #0099cc, #00d4ff)',
    glow: 'rgba(0, 212, 255, 0.5)',
    glowHover: 'rgba(0, 212, 255, 0.7)',
    text: '#ffffff',
    bg: 'transparent',
    border: '1px solid rgba(0, 212, 255, 0.4)',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #ff006e, #cc0058, #ff006e)',
    glow: 'rgba(255, 0, 110, 0.5)',
    glowHover: 'rgba(255, 0, 110, 0.7)',
    text: '#ffffff',
    bg: 'transparent',
    border: '1px solid rgba(255, 0, 110, 0.4)',
  },
  ghost: {
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    glow: 'rgba(255, 255, 255, 0.1)',
    glowHover: 'rgba(255, 255, 255, 0.2)',
    text: '#e2e8f0',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  danger: {
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c, #ef4444)',
    glow: 'rgba(239, 68, 68, 0.5)',
    glowHover: 'rgba(239, 68, 68, 0.7)',
    text: '#ffffff',
    bg: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.4)',
  },
};

export default function NeonButton({
  variant = 'primary',
  children,
  className = '',
  icon,
  loading = false,
  onClick,
  ...props
}: NeonButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const config = variantConfig[variant] || variantConfig['primary'];

  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${config.glow};
      left: ${x - 10}px;
      top: ${y - 10}px;
      pointer-events: none;
      animation: ripple 600ms ease-out forwards;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    onClick?.(e);
  }, [onClick, config.glow]);

  return (
    <motion.button
      ref={btnRef}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      style={{
        background: config.bg,
        border: config.border,
        borderRadius: '12px',
        padding: '12px 28px',
        color: config.text,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 'var(--text-sm)',
        letterSpacing: 'var(--tracking-wide)',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        textTransform: 'uppercase',
        boxShadow: `0 0 15px ${config.glow}`,
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      whileHover={{
        scale: 1.05,
        skewX: -1,
        boxShadow: `0 0 25px ${config.glowHover}, 0 0 50px ${config.glow}`,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleRipple}
      disabled={loading}
      {...props}
    >
      {/* Animated gradient border overlay */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          padding: '1px',
          background: config.gradient,
          backgroundSize: '200% 200%',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          animation: 'shimmer 3s linear infinite',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
        />
      ) : icon}
      {children}
    </motion.button>
  );
}
