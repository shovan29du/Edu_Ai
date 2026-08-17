import React from 'react';

export default function LoadingSpinner() {
  return (
    <div role="status" aria-live="polite" className="py-10 flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {['🌟', '📚', '🚀'].map((emoji, i) => (
          <span
            key={i}
            className="text-2xl animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          >{emoji}</span>
        ))}
      </div>
      <p className="text-sm font-semibold text-white/80">Loading your adventure…</p>
    </div>
  );
}
