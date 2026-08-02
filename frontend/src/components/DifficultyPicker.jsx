import React from 'react';

const LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// Small, reusable Easy/Medium/Hard selector shared by every game engine
// that supports difficulty tiers, so each one doesn't reinvent the button row.
export default function DifficultyPicker({ value, onChange, options = ['easy', 'medium', 'hard'], disabled = false }) {
  return (
    <div role="group" aria-label="Difficulty" className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          aria-pressed={value === opt}
          onClick={() => onChange(opt)}
          className={`rounded border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
            value === opt
              ? 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {LABELS[opt] || opt}
        </button>
      ))}
    </div>
  );
}
