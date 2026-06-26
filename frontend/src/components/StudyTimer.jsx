import React, { useEffect, useRef, useState } from 'react';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function StudyTimer() {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === 'focus' ? 'break' : 'focus';
          setMode(nextMode);
          return (nextMode === 'focus' ? FOCUS_MINUTES : BREAK_MINUTES) * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  function reset() {
    setRunning(false);
    setMode('focus');
    setSecondsLeft(FOCUS_MINUTES * 60);
  }

  return (
    <section aria-label="Study timer" className="rounded border p-4 text-center dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Study Timer</h2>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {mode === 'focus' ? 'Focus time — keep going!' : 'Break time — relax a bit!'}
      </p>
      <p className="mb-4 text-5xl font-mono" role="timer" aria-live="polite">
        {formatTime(secondsLeft)}
      </p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="rounded border px-4 py-2 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded border px-4 py-2 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
