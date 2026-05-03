'use client';

import React from 'react';
import { motion } from 'framer-motion';

type DeviceStatus = 'connected' | 'syncing' | 'error' | 'disconnected';

interface DeviceStatusCardProps {
  name: string;
  type: string;
  status: DeviceStatus;
  latency?: number;
  className?: string;
}

const statusConfig: Record<DeviceStatus, { color: string; label: string; bg: string }> = {
  connected: { color: '#00ff88', label: 'Connected', bg: 'rgba(0,255,136,0.08)' },
  syncing: { color: '#ffb703', label: 'Syncing...', bg: 'rgba(255,183,3,0.08)' },
  error: { color: '#ff006e', label: 'Error', bg: 'rgba(255,0,110,0.08)' },
  disconnected: { color: '#666', label: 'Disconnected', bg: 'rgba(100,100,100,0.08)' },
};

export default function DeviceStatusCard({ name, type, status, latency, className = '' }: DeviceStatusCardProps) {
  const cfg = statusConfig[status];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: cfg.bg, backdropFilter: 'blur(12px)',
        border: `1px solid ${cfg.color}33`, borderRadius: 12,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
        transition: 'border-color 250ms',
      }}
      whileHover={{ borderColor: `${cfg.color}66` }}
    >
      {/* Status dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', background: cfg.color,
        boxShadow: `0 0 8px ${cfg.color}80`,
        animation: status === 'syncing' ? 'pulse-glow 1.5s infinite' : 'none',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#e2e8f0' }}>{name}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>{type}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
        {latency !== undefined && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(226,232,240,0.4)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {latency}ms
          </div>
        )}
      </div>
    </motion.div>
  );
}
