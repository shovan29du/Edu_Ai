import { useState, useEffect, useRef } from 'react';

const SKILLS = [
  {
    id: 'adaptive-tutor',
    label: 'Adaptive Tutor',
    emoji: '🎓',
    chip: 'Tutor',
    tagline: 'Personalized step-by-step learning',
    welcome: "Hi! I'm your Adaptive Tutor. What topic would you like to explore today? Tell me your level and goal!",
  },
  {
    id: 'math-assessment',
    label: 'Math Coach',
    emoji: '🔢',
    chip: 'Maths',
    tagline: 'Homework help & problem solving',
    welcome: "Hello! I'm your Maths Coach. Share a problem you're working on, or tell me what topic you need help with!",
  },
  {
    id: 'language-coach',
    label: 'Language Coach',
    emoji: '🗣',
    chip: 'Language',
    tagline: 'Vocabulary, grammar & conversation',
    welcome: "Hola! Bonjour! مرحبا! I'm your Language Coach. Which language are you learning, and what's your level?",
  },
  {
    id: 'build-lesson-plan',
    label: 'Lesson Planner',
    emoji: '📋',
    chip: 'Planner',
    tagline: 'Build classroom-ready lesson plans',
    welcome: "Welcome, teacher! Tell me the subject, age group, and how long you have, and I'll build you a lesson plan.",
  },
  {
    id: 'general',
    label: 'General Chat',
    emoji: '💬',
    chip: 'Chat',
    tagline: 'Ask anything, learn anything',
    welcome: "Hi there! I'm Ark AI, your learning companion. Ask me anything!",
  },
];

function getSkillById(id) {
  return SKILLS.find((s) => s.id === id) || SKILLS[4];
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else if (line.match(/^[-*•]\s/)) {
      elements.push(
        <li key={key++} className="ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>
      );
    } else {
      elements.push(<p key={key++}>{renderInline(line)}</p>);
    }
  }
  return elements;
}

function ChatInterface({ skill, onSkillChange, context, compact }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const skillObj = getSkillById(skill);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: skillObj.welcome }]);
    setInput('');
  }, [skill]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ark-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          skill,
          context: context || {},
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Sorry, I could not get a response.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const msgBubble = (msg, i) => {
    const isUser = msg.role === 'user';
    return (
      <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        {!isUser && <span className="mr-2 mt-1 text-lg flex-shrink-0">🤖</span>}
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
            isUser
              ? 'bg-purple-700 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
          }`}
        >
          {isUser ? (
            msg.content
          ) : (
            <div className="space-y-1">{renderMarkdown(msg.content)}</div>
          )}
        </div>
        {isUser && <span className="ml-2 mt-1 text-lg flex-shrink-0">👤</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Skill chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 flex-shrink-0">
        {SKILLS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSkillChange(s.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              skill === s.id
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900'
            }`}
          >
            {s.emoji} {s.chip}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 px-1 min-h-0">
        {messages.map((msg, i) => msgBubble(msg, i))}
        {loading && (
          <div className="flex justify-start mb-3">
            <span className="mr-2 text-lg">🤖</span>
            <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:shadow-md transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// ── Full-page mode ────────────────────────────────────────────────────────────

function FullPage({ context }) {
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      {!activeSkill && (
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🤖</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            Ark AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Your intelligent learning companion — choose a skill to get started
          </p>
        </div>
      )}

      {!activeSkill && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-10">
          {SKILLS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSkill(s.id)}
              className="group text-left bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100 dark:border-gray-700"
            >
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1">{s.label}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{s.tagline}</p>
              <div className="mt-4 text-purple-700 dark:text-purple-400 text-sm font-semibold group-hover:underline">
                Start chatting →
              </div>
            </button>
          ))}
        </div>
      )}

      {activeSkill && (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setActiveSkill(null)}
            className="mb-4 text-purple-700 dark:text-purple-400 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            ← Back to skills
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col" style={{ height: '70vh' }}>
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <span className="text-2xl">{getSkillById(activeSkill).emoji}</span>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-xl">
                {getSkillById(activeSkill).label}
              </h2>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface
                skill={activeSkill}
                onSkillChange={setActiveSkill}
                context={context}
                compact={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Floating mode ─────────────────────────────────────────────────────────────

function FloatingAssistant({ context, activeTab }) {
  const [open, setOpen] = useState(false);
  const [skill, setSkill] = useState('adaptive-tutor');

  useEffect(() => {
    if (activeTab === 'Languages') {
      setSkill('language-coach');
    } else if (activeTab === 'AI Tutor' || activeTab === 'Subjects') {
      setSkill('adaptive-tutor');
    }
  }, [activeTab]);

  const contextHint =
    activeTab === 'Math Tools'
      ? '💡 Need help with a maths problem? Switch to Maths Coach!'
      : activeTab === 'Languages'
      ? '💡 Language Coach selected — ready to help you practise!'
      : null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-purple-300 dark:hover:shadow-purple-900 transition-all hover:scale-105 font-semibold text-sm"
        aria-label="Open Ark AI"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        🤖 Ark AI
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-gray-50 dark:bg-gray-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-purple-100 dark:border-gray-700"
          style={{ height: '520px' }}
        >
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="text-white font-bold text-base">Ark AI</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-xl leading-none transition-colors"
              aria-label="Close Ark AI"
            >
              ✕
            </button>
          </div>

          {contextHint && (
            <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-4 py-2 border-b border-purple-100 dark:border-purple-800 flex-shrink-0">
              {contextHint}
            </div>
          )}

          <div className="flex-1 flex flex-col p-3 min-h-0">
            <ChatInterface
              skill={skill}
              onSkillChange={setSkill}
              context={context}
              compact={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ArkAIAssistant({ fullPage = false, context = {}, activeTab = null }) {
  if (fullPage) {
    return <FullPage context={context} />;
  }
  return <FloatingAssistant context={context} activeTab={activeTab} />;
}
