import { useCallback, useRef, useState } from 'react';

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechRecognition({ onResult } = {}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const Recognition = getRecognitionConstructor();
  const supported = !!Recognition;

  const start = useCallback(() => {
    if (!supported || listening) return;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      if (transcript && onResult) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [supported, listening, onResult, Recognition]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
