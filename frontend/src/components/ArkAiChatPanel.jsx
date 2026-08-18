import { useEffect, useRef, useState } from 'react';
import { sendArkAiMessage } from '../api/arkAi.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export const ARK_AI_AGENTS_DEFAULT = [
  ['teacher', '🧑‍🏫 Teacher'],
  ['instructor', '📋 Instructor'],
  ['helper', '🤝 Helper'],
];

export const ARK_AI_AGENTS_ALL = [
  ...ARK_AI_AGENTS_DEFAULT,
  ['partner', '🗣️ Partner'],
  ['singing_partner', '🎤 Singing Partner'],
];

function speechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** The full Ark AI chat experience -- agent picker, message history, text
 * input, and optional voice commands (speech-to-text in, speech synthesis
 * out) -- as a reusable panel. Used both inside the floating ArkAiWidget and
 * embedded directly in pages (Search, Language Academy, Karaoke Centre) that
 * want the full assistant, not just a corner button. */
export default function ArkAiChatPanel({
  level,
  context = '',
  agents = ARK_AI_AGENTS_DEFAULT,
  defaultAgent,
  emptyHint = 'Ask Ark AI anything.',
  voice = true,
  panelClassName = 'h-[28rem] w-[22rem] max-w-[90vw]',
  onNewChat,
}) {
  const [agent, setAgent] = useState(defaultAgent || agents[0][0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [voiceReplies, setVoiceReplies] = useState(false);
  const listRef = useRef(null);

  const speechSupported = voice && speechSynthesisSupported();

  const { supported: micSupported, listening, start: startListening, stop: stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const text = transcript.trim();
      if (text) sendText(text);
    },
  });

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text) {
    if (!speechSupported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function sendText(text) {
    if (!text || sending) return;
    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setError('');
    setSending(true);
    try {
      const data = await sendArkAiMessage(text, history, { agent, level, context });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (voiceReplies) speak(data.reply);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendText(input.trim());
  }

  function handleNewChat() {
    setMessages([]);
    setError('');
    if (speechSupported) window.speechSynthesis.cancel();
    onNewChat?.();
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 ${panelClassName}`}>
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-bold">✨ Ark AI</p>
          <p className="text-[11px] opacity-90">A true assistant that changes role as needed</p>
        </div>
        <div className="flex items-center gap-1">
          {speechSupported && (
            <button
              type="button"
              onClick={() => setVoiceReplies((v) => !v)}
              aria-pressed={voiceReplies}
              title="Read replies aloud"
              className={`rounded-full px-2 py-1 text-xs font-medium ${voiceReplies ? 'bg-white text-indigo-700' : 'bg-white/20 hover:bg-white/30'}`}
            >
              {voiceReplies ? '🔊' : '🔇'}
            </button>
          )}
          <button
            type="button"
            onClick={handleNewChat}
            title="New chat"
            className="rounded-full bg-white/20 px-2 py-1 text-xs font-medium hover:bg-white/30"
          >
            New
          </button>
        </div>
      </div>

      {agents.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800" role="group" aria-label="Ark AI agent">
          {agents.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAgent(value)}
              aria-pressed={agent === value}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                agent === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 && <p className="text-sm text-gray-400">{emptyHint}</p>}
        {messages.map((m, index) => (
          <div
            key={index}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && <p className="text-xs text-gray-400">Ark AI is thinking…</p>}
      </div>

      {error && <p role="alert" className="mx-3 mb-2 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-2 dark:border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Ark AI…"
          className="min-w-0 flex-1 rounded-full border px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {micSupported && voice && (
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            aria-pressed={listening}
            aria-label={listening ? 'Stop voice command' : 'Speak a voice command to Ark AI'}
            title="Voice command"
            className={`rounded-full border px-3 py-1.5 text-sm ${listening ? 'bg-red-100 dark:bg-red-900' : ''}`}
          >
            {listening ? '🎙️' : '🎤'}
          </button>
        )}
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
