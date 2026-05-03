import React from 'react';

export const PERSONAS = [
  {
    id: 'harsha',
    name: 'Harsha',
    language: 'en',
    style: 'Eloquent, poetic English. Use cricket metaphors.',
    catchphrases: ['What a shot!', 'He found the gap perfectly.'],
    voiceRegex: /en-IN|en-GB/i,
    flag: '🇬🇧'
  },
  {
    id: 'ravi',
    name: 'Ravi',
    language: 'hi',
    style: 'Dramatic Hindi commentary. Very expressive.',
    catchphrases: ['Kya shot hai!', 'Shaandar chhakka!'],
    voiceRegex: /hi-IN/i,
    flag: '🇮🇳'
  },
  {
    id: 'sundar',
    name: 'Sundar',
    language: 'ta',
    style: 'Passionate Tamil. Short punchy sentences.',
    catchphrases: ['Arumaiyana shot!', 'Ennada idu!'],
    voiceRegex: /ta-IN/i,
    flag: '🛕'
  },
  {
    id: 'arnab',
    name: 'Arnab',
    language: 'bn',
    style: 'Poetic Bengali. Reference historical matches.',
    catchphrases: ['Darun shat!', 'Eki kando!'],
    voiceRegex: /bn-IN|bn-BD/i,
    flag: '🐅'
  }
];

export default function LanguagePersonaSelector({ 
  selectedId, 
  onSelect 
}: { 
  selectedId: string, 
  onSelect: (id: string) => void 
}) {
  const playSample = (persona: any) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(persona.catchphrases[0]);
      
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => persona.voiceRegex.test(v.lang) || persona.voiceRegex.test(v.name));
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = 1.1;
      utterance.pitch = persona.language === 'en' ? 0.9 : 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {PERSONAS.map(p => (
        <button
          key={p.id}
          onClick={() => {
            onSelect(p.id);
            playSample(p);
          }}
          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
            selectedId === p.id 
              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.3)]' 
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <div className="text-2xl mb-1">{p.flag}</div>
          <div className="font-bold text-sm text-white">{p.name}</div>
          <div className="text-[10px] text-white/50 uppercase">{p.language.toUpperCase()}</div>
        </button>
      ))}
    </div>
  );
}
