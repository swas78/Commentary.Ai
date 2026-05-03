// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/ui';
import { useSessionStore } from '@/store/useSessionStore';
import { useCommentaryStore } from '@/store/useCommentaryStore';
import { Canvas } from '@react-three/fiber';
import { Torus, MeshDistortMaterial, Float } from '@react-three/drei';
import { ThreeErrorBoundary } from '@/components/ThreeErrorBoundary';

// Dynamic imports for charts to prevent SSR hydration errors
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart as any), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area as any), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart as any), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar as any), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart as any), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line as any), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis as any), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis as any), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip as any), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer as any), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend as any), { ssr: false });

const timelineData = [
  { time: '10:00', count: 12 }, { time: '10:05', count: 18 }, { time: '10:10', count: 45 },
  { time: '10:15', count: 32 }, { time: '10:20', count: 56 }, { time: '10:25', count: 24 },
];

const sentimentData = [
  { name: 'Excited', value: 65, fill: '#ff006e' },
  { name: 'Neutral', value: 25, fill: '#00d4ff' },
  { name: 'Critical', value: 10, fill: '#00ff88' },
];

const engagementData = [
  { time: '10:00', reactions: 120, shares: 15 }, { time: '10:05', reactions: 210, shares: 35 },
  { time: '10:10', reactions: 450, shares: 80 }, { time: '10:15', reactions: 380, shares: 45 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-bold text-white/50 mb-1">{label}</p>
        <p className="text-sm font-black text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function DevicePieChart() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <group rotation={[0.5, 0.5, 0]}>
          <Torus args={[1.2, 0.4, 16, 50]} arc={Math.PI * 1.2} position={[0, 0, 0]}>
            <MeshDistortMaterial color="#00d4ff" distort={0.2} speed={2} wireframe />
          </Torus>
          <Torus args={[1.2, 0.4, 16, 50]} arc={Math.PI * 0.6} position={[0, 0, 0]} rotation={[0, 0, Math.PI * 1.2]}>
            <MeshDistortMaterial color="#ff006e" distort={0.2} speed={2} />
          </Torus>
          <Torus args={[1.2, 0.4, 16, 50]} arc={Math.PI * 0.2} position={[0, 0, 0]} rotation={[0, 0, Math.PI * 1.8]}>
            <MeshDistortMaterial color="#00ff88" distort={0.2} speed={2} />
          </Torus>
        </group>
      </Float>
    </Canvas>
  );
}

export default function AnalyticsDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-[#060913]" />;

  return (
    <div className="min-h-screen bg-[#060913] text-white p-6 md:p-10">
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <span className="text-cyan-400">🏏 CMNT.AI</span> 
            <span className="text-white/20">/</span> 
            ANALYTICS
          </h1>
          <p className="text-white/50 text-sm">Real-time session performance & engagement metrics</p>
        </div>
        <Link href="/commentary" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 font-bold transition-colors">
          Return to Studio
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <GlassCard variant="glow" className="p-5">
          <div className="text-white/50 text-xs font-bold tracking-wider mb-2 uppercase">Total Generated</div>
          <div className="text-4xl font-black text-white">1,284</div>
        </GlassCard>
        <GlassCard variant="base" className="p-5">
          <div className="text-white/50 text-xs font-bold tracking-wider mb-2 uppercase">Active Devices</div>
          <div className="text-4xl font-black text-cyan-400">22</div>
        </GlassCard>
        <GlassCard variant="base" className="p-5">
          <div className="text-white/50 text-xs font-bold tracking-wider mb-2 uppercase">Avg Latency</div>
          <div className="text-4xl font-black text-green-400">8ms</div>
        </GlassCard>
        <GlassCard variant="base" className="p-5">
          <div className="text-white/50 text-xs font-bold tracking-wider mb-2 uppercase">AI Accuracy</div>
          <div className="text-4xl font-black text-pink-400">94.2%</div>
        </GlassCard>
        <GlassCard variant="base" className="p-5">
          <div className="text-white/50 text-xs font-bold tracking-wider mb-2 uppercase">Status</div>
          <div className="text-4xl font-black text-white">02:45:10</div>
        </GlassCard>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard variant="dark" className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Commentary Volume</h2>
              <div className="text-2xl font-black mt-1">Generation Timeline</div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard variant="dark" className="p-6">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-6">Sentiment Distribution</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard variant="dark" className="p-6">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Device Distribution</h2>
          <div className="text-2xl font-black mb-4">WebRTC Topography</div>
          <div className="h-[200px] w-full relative bg-black/20 rounded-xl overflow-hidden border border-white/5">
             <ThreeErrorBoundary>
               <DevicePieChart />
             </ThreeErrorBoundary>
             <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-bold px-2 py-1 bg-black/50 backdrop-blur rounded border border-white/10">
               <span className="text-cyan-400">Mobile (60%)</span>
               <span className="text-pink-400">Desktop (30%)</span>
               <span className="text-green-400">Tablet (10%)</span>
             </div>
          </div>
        </GlassCard>

        <GlassCard variant="dark" className="p-6 lg:col-span-2 flex flex-col">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Viral Moments</h2>
          <div className="text-2xl font-black mb-4">Top Commentaries</div>
          <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col gap-2 overflow-y-auto">
             {[
               { id: 1, text: "What an absolute screamer of a shot! He has picked the bones out of that delivery and sent it sailing into the second tier.", score: "99%", persona: "Harsha" },
               { id: 2, text: "Oh, that's beautifully timed. Just a mere push and it races away to the extra cover boundary. Class written all over it.", score: "92%", persona: "Harsha" },
               { id: 3, text: "Kya shot hai! Absolutely massive hit out of the park!", score: "88%", persona: "Ravi" }
             ].map((c, i) => (
               <div key={c.id} className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">#{i+1}</div>
                  <div className="flex-1">
                    <p className="text-sm text-white/90 italic">"{c.text}"</p>
                    <span className="text-[10px] font-bold text-white/40 uppercase mt-1 block">Persona: {c.persona}</span>
                  </div>
                  <div className="text-right">
                     <span className="block text-xl font-black text-pink-400">{c.score}</span>
                     <span className="text-[10px] text-white/50">ENGAGEMENT</span>
                  </div>
               </div>
             ))}
          </div>
        </GlassCard>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="dark" className="p-6">
          <h3 className="text-sm font-bold text-white/70 tracking-widest uppercase mb-6">Audience Engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="reactions" stroke="#ff006e" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                <Line type="monotone" dataKey="shares" stroke="#00ff88" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Device Performance Table */}
        <GlassCard variant="base" className="p-6">
          <h3 className="text-sm font-bold text-white/70 tracking-widest uppercase mb-6 flex justify-between">
            Device Performance <span className="text-cyan-400 font-normal normal-case">WebRTC Network</span>
          </h3>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-white/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Device Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Latency</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Director iPad Pro', type: 'Tablet', latency: 4, status: 'Excellent' },
                  { name: 'Studio Monitor 1', type: 'Desktop', latency: 8, status: 'Excellent' },
                  { name: 'Fan iPhone 15', type: 'Mobile', latency: 18, status: 'Good' },
                  { name: 'Remote Client', type: 'Mobile', latency: 85, status: 'Fair' },
                ].map((device, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white/90">{device.name}</td>
                    <td className="px-4 py-3 text-white/60">{device.type}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={device.latency < 20 ? 'text-green-400' : device.latency < 50 ? 'text-yellow-400' : 'text-orange-400'}>
                        {device.latency}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${device.latency < 20 ? 'bg-green-500' : device.latency < 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
