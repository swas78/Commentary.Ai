import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioAnalyser() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize context on first user interaction to bypass browser autoplay policies
  const initAudio = useCallback(async () => {
    if (audioContext) {
      if (audioContext.state === 'suspended') await audioContext.resume();
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      
      // 64 frequency bins (fftSize 128 -> frequencyBinCount 64)
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setAudioContext(ctx);

      // Try to connect microphone (Optional, for demo purposes if no TTS is playing)
      // In a real app, you'd connect the TTS output node here instead
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;
      } catch (err) {
        console.warn('Microphone access denied, visualizer will need TTS source connected later.', err);
      }
    } catch (err) {
      console.error('Failed to initialize AudioContext:', err);
    }
  }, [audioContext]);

  // Provide methods to get real-time data without triggering React re-renders
  const getFrequencyData = useCallback((): Uint8Array<ArrayBuffer> | null => {
    if (!analyserRef.current || !dataArrayRef.current) return null;
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
    return dataArrayRef.current;
  }, []);

  const getEnergyLevel = useCallback((): number => {
    const data = getFrequencyData();
    if (!data) return 0;
    
    // Calculate RMS or simple average for energy
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const average = sum / data.length;
    return average / 255; // Normalize 0-1
  }, [getFrequencyData]);

  // Clean up
  useEffect(() => {
    return () => {
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, [audioContext]);

  return { initAudio, getFrequencyData, getEnergyLevel, isInitialized: !!audioContext };
}
