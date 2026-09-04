import { useCallback } from 'react';

interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = () => {
  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'hi-IN';
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  const isSupported = 'speechSynthesis' in window;

  return { speak, stop, isSupported };
};