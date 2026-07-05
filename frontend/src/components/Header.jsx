import React, { useState, useEffect, useCallback } from 'react';
import ChildSelector from './ChildSelector.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import ParentalControlPanel from './ParentalControlPanel.jsx';

function TTSToggle() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('tts-enabled') === 'true');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('tts-enabled', enabled);
    if (!enabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    function handleSelection() {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      if (!text || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [enabled]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  if (!window.speechSynthesis) return null;

  return (
    <div className="flex items-center gap-1">
      {speaking && (
        <button
          onClick={stopSpeaking}
          title="Stop speaking"
          className="rounded-full p-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400"
        >
          ⏹
        </button>
      )}
      <button
        onClick={() => setEnabled(e => !e)}
        title={enabled ? 'Text-to-Speech: ON — select text to hear it read aloud' : 'Enable Text-to-Speech'}
        className={`rounded-full px-2 py-1 text-xs font-medium transition ${
          enabled
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {enabled ? '🔊 TTS ON' : '🔇 TTS'}
      </button>
    </div>
  );
}

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b p-4 dark:bg-gray-900 dark:text-white">
      <h1 className="text-xl font-bold">Global Education Platform</h1>
      <div className="flex items-center gap-3">
        <TTSToggle />
        <ChildSelector />
        <DarkModeToggle />
        <ParentalControlPanel />
      </div>
    </header>
  );
}
