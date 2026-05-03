import { useState, useRef, useCallback } from 'react';

export function useClipRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback((canvasSelector: string) => {
    try {
      const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;
      if (!canvas) throw new Error("Canvas not found");

      // Capture 30fps video stream from canvas
      const stream = canvas.captureStream(30);

      // In a real implementation, we would use Web Audio API to capture the 
      // SpeechSynthesis and Tone.js output, route them to a MediaStreamDestination,
      // and add that audio track to this stream.
      // For this demo, we'll record video only to ensure browser compatibility.
      
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(stream, options);
      
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setClipUrl(url);
        
        // Simulate a backend upload generating a share token
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();
        setShareToken(token);
      };

      recorder.start(100); // collect 100ms chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      // Auto-stop after 15 seconds for viral clip length
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 15000);
      
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    clipUrl,
    shareToken,
    clearClip: () => { setClipUrl(null); setShareToken(null); }
  };
}
