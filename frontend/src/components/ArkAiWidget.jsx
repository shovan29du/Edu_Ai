import { useState } from 'react';
import ArkAiChatPanel from './ArkAiChatPanel.jsx';

export default function ArkAiWidget({ level }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3">
          <ArkAiChatPanel
            level={level}
            emptyHint="Ask Ark AI anything. Teacher explains and builds understanding, Instructor gives step-by-step guidance, and Helper gives fast, general-purpose assistance."
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Ark AI' : 'Open Ark AI'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 text-2xl text-white shadow-xl transition hover:scale-105"
      >
        {open ? '✕' : '✨'}
      </button>
    </div>
  );
}
