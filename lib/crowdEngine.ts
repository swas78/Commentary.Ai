import { useEffect, useRef, useState } from 'react';
import type * as ToneType from 'tone';
import { useCommentaryStore } from '@/store/useCommentaryStore';

let isToneStarted = false;

export function useCrowdEngine() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(-10); // dB
  const commentaries = useCommentaryStore(s => s.commentaries);
  
  // Synths
  const crowdNoiseRef = useRef<ToneType.Noise | null>(null);
  const crowdFilterRef = useRef<ToneType.Filter | null>(null);
  const reverbRef = useRef<ToneType.Reverb | null>(null);
  const volumeNodeRef = useRef<ToneType.Volume | null>(null);
  const hornSynthRef = useRef<ToneType.Synth | null>(null);
  const toneRef = useRef<typeof ToneType | null>(null);

  // Initialize Audio Context on demand (requires user gesture)
  const initEngine = async () => {
    const Tone = await import('tone');
    toneRef.current = Tone;
    
    if (isToneStarted) {
      setEnabled(true);
      if (crowdNoiseRef.current) crowdNoiseRef.current.start();
      return;
    }

    await Tone.start();
    isToneStarted = true;

    // Master Volume
    volumeNodeRef.current = new Tone.Volume(volume).toDestination();

    // Stadium Reverb (Large Hall simulation)
    reverbRef.current = new Tone.Reverb({
      decay: 4.5,
      preDelay: 0.1,
    });
    
    // Low pass filter to make noise sound like distant crowd murmur
    crowdFilterRef.current = new Tone.Filter(400, 'lowpass');

    // Base Crowd Murmur (Brown Noise is best for crowds)
    crowdNoiseRef.current = new Tone.Noise('brown');
    crowdNoiseRef.current.chain(crowdFilterRef.current, reverbRef.current, volumeNodeRef.current);
    
    // Stadium Horn Synth for Milestones
    hornSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 2 }
    }).chain(reverbRef.current, volumeNodeRef.current);

    crowdNoiseRef.current.start();
    crowdNoiseRef.current.volume.value = -15; // Base murmur level
    setEnabled(true);
  };

  const stopEngine = () => {
    if (crowdNoiseRef.current) crowdNoiseRef.current.stop();
    setEnabled(false);
  };

  // Update volume
  useEffect(() => {
    if (volumeNodeRef.current) {
      volumeNodeRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  // React to new commentaries
  useEffect(() => {
    if (!enabled || commentaries.length === 0 || !crowdNoiseRef.current || !crowdFilterRef.current || !toneRef.current) return;

    const Tone = toneRef.current;
    const latest = commentaries[commentaries.length - 1];
    const now = Tone.now();

    if (latest.sentiment === 'excited') {
      // Crowd Roar
      crowdNoiseRef.current.volume.rampTo(-2, 0.2, now); // Volume spike
      crowdFilterRef.current.frequency.rampTo(1200, 0.2, now); // Open filter
      
      // Fade back down after 3 seconds
      crowdNoiseRef.current.volume.rampTo(-15, 3, now + 1);
      crowdFilterRef.current.frequency.rampTo(400, 3, now + 1);

      // Check for milestones
      if (latest.text.includes('100') || latest.text.includes('century') || latest.text.includes('fifty')) {
        hornSynthRef.current?.triggerAttackRelease('A2', 1.5, now);
        hornSynthRef.current?.triggerAttackRelease('A2', 1.5, now + 2);
      }
    } else if (latest.sentiment === 'disappointed' || latest.text.toUpperCase().includes('OUT')) {
      // Sudden gasp then opposing crowd cheer
      crowdNoiseRef.current.volume.rampTo(-30, 0.1, now); // Instant quiet
      crowdNoiseRef.current.volume.rampTo(-5, 0.5, now + 0.5); // Opposing cheer
      crowdFilterRef.current.frequency.rampTo(2000, 0.5, now + 0.5);
      
      // Fade down
      crowdNoiseRef.current.volume.rampTo(-15, 2, now + 2);
      crowdFilterRef.current.frequency.rampTo(400, 2, now + 2);
    } else {
      // Neutral - maintain base murmur
      crowdNoiseRef.current.volume.rampTo(-15, 1, now);
      crowdFilterRef.current.frequency.rampTo(400, 1, now);
    }

  }, [commentaries, enabled]);

  return {
    enabled,
    initEngine,
    stopEngine,
    volume,
    setVolume
  };
}
