import React, { useState, useEffect, useCallback } from 'react';
import ChildSelector from './ChildSelector.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import ParentalControlPanel from './ParentalControlPanel.jsx';
import { useChild, isParentProfile } from '../contexts/ChildContext.jsx';

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

function UpdateLinksButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showReport, setShowReport] = useState(false);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch('/api/refresh-all-links', { method: 'POST' });
      setResult(await r.json());
      setShowReport(true);
    } catch {
      setResult({ error: 'Could not reach server.' });
      setShowReport(true);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleRun}
        disabled={running}
        title="Check and repair all content links"
        className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
      >
        {running
          ? <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> Checking…</>
          : <>🔄 Update Links</>}
      </button>

      {showReport && result && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-gray-100">Link Health Report</span>
            <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
          </div>

          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <>
              <div className="mb-3 flex gap-3 text-sm">
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                  🔍 {result.total_checked.toLocaleString()} checked
                </span>
                {result.total_fixed > 0 && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    🔧 {result.total_fixed} fixed
                  </span>
                )}
                {result.total_broken > 0 ? (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    ⚠ {result.total_broken} broken
                  </span>
                ) : (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    ✅ All healthy
                  </span>
                )}
              </div>

              <div className="max-h-64 space-y-1 overflow-y-auto text-xs">
                {Object.entries(result.report).map(([cat, r]) => (
                  <div key={cat} className="flex items-center justify-between rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                    <span className={`font-medium ${r.broken > 0 ? 'text-red-600 dark:text-red-400' : r.fixed > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                      {r.broken > 0 ? `⚠ ${r.broken} broken` : r.fixed > 0 ? `🔧 ${r.fixed} fixed` : '✅'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { child } = useChild();
  const isParent = isParentProfile(child);

  return (
    <header className="flex items-center justify-between border-b p-4 dark:bg-gray-900 dark:text-white">
      <h1 className="text-xl font-bold">Global Education Platform</h1>
      <div className="flex items-center gap-3">
        <TTSToggle />
        {isParent && <UpdateLinksButton />}
        <ChildSelector />
        <DarkModeToggle />
        <ParentalControlPanel />
      </div>
    </header>
  );
}
