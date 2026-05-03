'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function AnimatedSwitch({ checked, onChange, label, className = '' }: AnimatedSwitchProps) {
  return (
    <label className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <motion.div
        onClick={() => onChange(!checked)}
        style={{
          width: 48, height: 26, borderRadius: 13, padding: 3, cursor: 'pointer',
          background: checked ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${checked ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: checked ? '0 0 12px rgba(0,212,255,0.3)' : 'none',
          display: 'flex', alignItems: 'center',
          transition: 'background 250ms, border-color 250ms, box-shadow 250ms',
        }}
      >
        <motion.div
          animate={{ x: checked ? 22 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: checked ? '#00d4ff' : 'rgba(226,232,240,0.5)',
            boxShadow: checked ? '0 0 8px rgba(0,212,255,0.6)' : 'none',
          }}
        />
      </motion.div>
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'rgba(226,232,240,0.7)' }}>{label}</span>}
    </label>
  );
}
