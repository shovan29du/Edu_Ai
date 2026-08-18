import React, { useEffect, useState } from 'react';

function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export default function ReadAloudButton({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSupported();

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported || !text) return null;

  function handleClick() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={speaking}
      className="rounded border px-2 py-0.5 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
    >
      {speaking ? '⏹ Stop' : '🔊 Read aloud'}
    </button>
  );
}
