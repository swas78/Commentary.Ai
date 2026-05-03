import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSlider, AnimatedSwitch } from '@/components/ui';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'avatar' | 'voice' | 'audio' | 'network' | 'accessibility' | 'battle'>('avatar');

  // Dummy State for UI Demo
  const [eq, setEq] = useState({ hz60: 50, hz250: 50, hz1k: 50, hz4k: 50, hz16k: 50 });
  const [masterVol, setMasterVol] = useState(75);
  const [noiseSup, setNoiseSup] = useState(true);
  const [echoCancel, setEchoCancel] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState(true);
  const [autoStart, setAutoStart] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#060913]/90 backdrop-blur-md" 
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3, staggerChildren: 0.05 }}
            className="relative w-full max-w-5xl h-[85vh] bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,212,255,0.1)] flex overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Sidebar */}
            <div className="w-64 bg-white/[0.02] border-r border-white/10 flex flex-col p-6 space-y-2 shrink-0">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white mb-8">PREFERENCES</h2>
              
              {(['avatar', 'voice', 'audio', 'network', 'accessibility', 'battle'] as const).map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab 
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-[inset_2px_0_0_#06b6d4]' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                
                {/* AVATAR TAB */}
                {activeTab === 'avatar' && (
                  <motion.div key="avatar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-white mb-4">Avatar Gallery</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`aspect-square rounded-xl border ${i===1 ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-white/10 opacity-50 cursor-pointer hover:opacity-100'} bg-black/50 flex items-center justify-center relative overflow-hidden group`}>
                             <div className="text-white/20 group-hover:text-cyan-400 transition-colors">MODEL {i}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Skin Tone</h3>
                      <div className="flex gap-3">
                         {['#f9d9ce', '#e3a991', '#c78066', '#a15c44', '#703a28', '#38160d'].map(color => (
                            <button key={color} className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white transition-colors" style={{ backgroundColor: color }} />
                         ))}
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Outfit Variant</h3>
                      <div className="grid grid-cols-3 gap-3">
                         {['Home Kit', 'Away Kit', 'Practice'].map(kit => (
                            <button key={kit} className="py-2 px-3 rounded-lg border border-white/20 hover:border-cyan-400 text-sm font-medium transition-colors">{kit}</button>
                         ))}
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Expression Intensity</h3>
                      <GlassSlider value={75} onChange={()=>{}} min={0} max={100} />
                    </section>
                  </motion.div>
                )}

                {/* VOICE TAB */}
                {activeTab === 'voice' && (
                  <motion.div key="voice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Persona Selector</h3>
                        <button className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-bold hover:bg-cyan-500/30">PREVIEW VOICE</button>
                      </div>
                      <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none mb-6">
                        <option>English (Male) - Harsha</option>
                        <option>Hindi (Male) - Ravi</option>
                        <option>Tamil (Male) - Sundar</option>
                        <option>Bengali (Male) - Arnab</option>
                      </select>
                    </section>
                    <section className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Voice Speed</h3>
                        <GlassSlider value={50} onChange={()=>{}} min={0} max={100} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Voice Pitch</h3>
                        <GlassSlider value={50} onChange={()=>{}} min={0} max={100} />
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">TTS Provider</h3>
                      <div className="flex gap-4">
                         <button className="flex-1 py-3 border border-cyan-400 bg-cyan-500/10 rounded-xl text-sm font-bold text-cyan-400">Web Speech API (Free)</button>
                         <button className="flex-1 py-3 border border-white/10 hover:border-white/30 bg-black/30 rounded-xl text-sm font-bold text-white/50">ElevenLabs (Premium)</button>
                      </div>
                    </section>
                  </motion.div>
                )}

                {/* AUDIO TAB */}
                {activeTab === 'audio' && (
                  <motion.div key="audio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <section>
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Input Device</h3>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none mb-4">
                          <option>Default - MacBook Pro Microphone</option>
                          <option>External USB Mic</option>
                        </select>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-bold text-white/40">LEVEL</span>
                           <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex">
                              <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-[65%] animate-pulse" />
                           </div>
                        </div>
                      </section>
                      <section className="space-y-6">
                         <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                            <span className="text-sm font-medium">Noise Suppression</span>
                            <AnimatedSwitch checked={noiseSup} onChange={setNoiseSup} />
                         </div>
                         <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                            <span className="text-sm font-medium">Echo Cancellation</span>
                            <AnimatedSwitch checked={echoCancel} onChange={setEchoCancel} />
                         </div>
                      </section>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    <section>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Crowd Noise Equalizer (5-Band)</h3>
                        <div className="w-48"><GlassSlider value={masterVol} onChange={setMasterVol} min={0} max={100} /></div>
                      </div>
                      <div className="flex justify-between items-end h-40 bg-black/30 rounded-xl p-6 border border-white/5">
                         {[
                           { label: '60Hz', key: 'hz60' },
                           { label: '250Hz', key: 'hz250' },
                           { label: '1kHz', key: 'hz1k' },
                           { label: '4kHz', key: 'hz4k' },
                           { label: '16kHz', key: 'hz16k' }
                         ].map(band => (
                           <div key={band.key} className="flex flex-col items-center gap-4 h-full">
                              <div className="flex-1 w-2 bg-white/10 rounded-full relative overflow-hidden group cursor-pointer">
                                 <div 
                                   className="absolute bottom-0 w-full bg-cyan-400 rounded-full transition-all group-hover:bg-pink-400" 
                                   style={{ height: `${eq[band.key as keyof typeof eq]}%` }}
                                 />
                              </div>
                              <span className="text-[10px] text-white/40 font-mono font-bold">{band.label}</span>
                           </div>
                         ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {/* NETWORK TAB */}
                {activeTab === 'network' && (
                  <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <section className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-xl flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center relative">
                           <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20 animate-ping" />
                           <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-cyan-400 mb-1">EXCELLENT CONNECTION</h3>
                          <p className="text-sm text-cyan-400/70">P2P WebRTC established. Latency: 8ms</p>
                        </div>
                     </section>

                     <section className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Sync Protocol</h3>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                            <option>WebRTC (Low Latency P2P)</option>
                            <option>Socket.io (Relay Server)</option>
                          </select>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Stream Quality</h3>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                            <option>1080p (HQ)</option>
                            <option>720p (Standard)</option>
                            <option>480p (Data Saver)</option>
                            <option>Auto</option>
                          </select>
                        </div>
                     </section>
                  </motion.div>
                )}

                {/* ACCESSIBILITY TAB */}
                {activeTab === 'accessibility' && (
                  <motion.div key="accessibility" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="flex justify-between items-center bg-white/5 p-5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-base font-bold block mb-1">High Contrast Mode</span>
                          <span className="text-xs text-white/50 block">Increases contrast for UI elements and text.</span>
                        </div>
                        <AnimatedSwitch checked={highContrast} onChange={setHighContrast} />
                      </div>
                      
                      <div className="flex justify-between items-center bg-white/5 p-5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-base font-bold block mb-1">Reduce Motion</span>
                          <span className="text-xs text-white/50 block">Disables non-essential 3D animations and UI transitions.</span>
                        </div>
                        <AnimatedSwitch checked={reduceMotion} onChange={setReduceMotion} />
                      </div>

                      <div className="flex justify-between items-center bg-white/5 p-5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-base font-bold block mb-1">Live Captions</span>
                          <span className="text-xs text-white/50 block">Show generated commentary as CC on the camera feed.</span>
                        </div>
                        <AnimatedSwitch checked={liveCaptions} onChange={setLiveCaptions} />
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Keyboard Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-4">
                           {[{k:'Space', d:'Toggle Mute'}, {k:'M', d:'Manual Override'}, {k:'C', d:'Toggle Captions'}, {k:'Esc', d:'Close Modals'}].map(s => (
                             <div key={s.k} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                                <span className="text-sm text-white/70">{s.d}</span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono font-bold text-white">{s.k}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                  </motion.div>
                )}

                {/* BATTLE TAB */}
                {activeTab === 'battle' && (
                  <motion.div key="battle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <section className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Default Team A Persona</h3>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                            <option>English (Male) - Harsha</option>
                            <option>Hindi (Male) - Ravi</option>
                          </select>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Default Team B Persona</h3>
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                            <option>Tamil (Male) - Sundar</option>
                            <option>Bengali (Male) - Arnab</option>
                          </select>
                        </div>
                     </section>
                     <div className="h-px w-full bg-white/10" />
                     <section>
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Round Duration</h3>
                         <span className="text-xs font-mono text-cyan-400">60 Seconds</span>
                       </div>
                       <GlassSlider value={50} onChange={()=>{}} min={0} max={100} />
                     </section>
                     <div className="flex justify-between items-center bg-white/5 p-5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-base font-bold block mb-1">Auto-Start Next Round</span>
                          <span className="text-xs text-white/50 block">Automatically begin the next battle round after voting ends.</span>
                        </div>
                        <AnimatedSwitch checked={autoStart} onChange={setAutoStart} />
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
