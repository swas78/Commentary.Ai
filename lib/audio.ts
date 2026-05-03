// Audio utility for TTS playback and sound effects using Howler.js

let Howl: typeof import('howler').Howl | null = null;

async function getHowl() {
  if (!Howl) {
    const howler = await import('howler');
    Howl = howler.Howl;
  }
  return Howl;
}

// Sound effect cache
const soundCache = new Map<string, import('howler').Howl>();

export async function playSound(src: string, volume = 0.5): Promise<void> {
  const HowlClass = await getHowl();
  let sound = soundCache.get(src);

  if (!sound) {
    sound = new HowlClass({ src: [src], volume, preload: true });
    soundCache.set(src, sound);
  }

  sound.volume(volume);
  sound.play();
}

export async function playSoundEffect(name: 'four' | 'six' | 'wicket' | 'cheer' | 'notification', volume = 0.5): Promise<void> {
  const soundMap: Record<string, string> = {
    four: '/sounds/four.mp3',
    six: '/sounds/six.mp3',
    wicket: '/sounds/wicket.mp3',
    cheer: '/sounds/cheer.mp3',
    notification: '/sounds/notification.mp3',
  };
  const src = soundMap[name];
  if (src) await playSound(src, volume);
}

// ── Browser TTS ───────────────────────────────────────────────
export function speak(text: string, options?: { lang?: string; rate?: number; pitch?: number; volume?: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}
