import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export default function VoiceInputButton({ onResult, label = 'Voice input' }) {
  const { supported, listening, start, stop } = useSpeechRecognition({ onResult });

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-pressed={listening}
      aria-label={listening ? `Stop ${label.toLowerCase()}` : label}
      title={label}
      className={`rounded border px-2 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500 ${
        listening ? 'bg-red-100 dark:bg-red-900' : ''
      }`}
    >
      {listening ? '🎙️ Listening…' : '🎤'}
    </button>
  );
}
