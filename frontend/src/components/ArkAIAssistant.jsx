import { useState, useEffect, useRef } from 'react';

const API = '/api';

const SKILLS = [
  { id: 'adaptive-tutor',   label: 'Tutor',    emoji: '🎓', color: 'bg-indigo-600',  welcome: "Hi! I'm your Adaptive Tutor. What topic would you like to explore today? Tell me your level and goal!" },
  { id: 'math-assessment',  label: 'Maths',    emoji: '🔢', color: 'bg-emerald-600', welcome: "Hello! I'm your Maths Coach. Share a problem you're working on, or tell me what topic you need help with!" },
  { id: 'language-coach',   label: 'Language', emoji: '🗣', color: 'bg-violet-600',  welcome: "Hola! Bonjour! مرحبا! I'm your Language Coach. Which language are you learning, and what's your level?" },
  { id: 'build-lesson-plan',label: 'Planner',  emoji: '📋', color: 'bg-amber-600',   welcome: "Welcome! Tell me the subject, age group, and how long you have, and I'll build you a lesson plan." },
  { id: 'general',          label: 'Chat',     emoji: '💬', color: 'bg-purple-600',  welcome: "Hi there! I'm Ark AI, your learning companion. Ask me anything!" },
];

const TAB_SKILL_MAP = {
  'Math Tools': 'math-assessment',
  'STEM Lab': 'math-assessment',
  'Languages': 'language-coach',
  'Grammar': 'language-coach',
  'Vocabulary': 'language-coach',
  'Subjects': 'adaptive-tutor',
  'AI Tutor': 'adaptive-tutor',
  'Study Coach': 'adaptive-tutor',
  'Personalized': 'adaptive-tutor',
};

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-0.5">🤖</div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
        isUser
          ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-br-sm'
          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-sm'
      }`}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ skill, setSkill, messages, setMessages, level, subject, child, onClose, fullPage }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const skillInfo = SKILLS.find(s => s.id === skill) || SKILLS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const allMessages = messages.length === 0
    ? [{ role: 'assistant', content: skillInfo.welcome }]
    : messages;

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMsgs = [...(messages.length === 0 ? [] : messages), userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/ark-ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, skill, context: { level, subject, child } }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.reply || data.content || 'Sorry, I could not generate a response.' }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: 'Connection error — please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex flex-col ${fullPage ? 'h-[600px]' : 'h-[480px]'} bg-white dark:bg-gray-800`}>
      {/* Skill chips */}
      <div className="flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {SKILLS.map(s => (
          <button key={s.id} onClick={() => { setSkill(s.id); setMessages([]); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              skill === s.id ? `${s.color} text-white shadow-sm` : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {allMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">🤖</div>
            <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={`Ask ${skillInfo.emoji} ${skillInfo.label}…`}
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
        />
        <button onClick={send} disabled={!input.trim() || loading}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
          ↑
        </button>
      </div>
    </div>
  );
}

export default function ArkAIAssistant({ level = '1', subject = '', child = '', activeTab = '', fullPage = false }) {
  const suggestedSkill = TAB_SKILL_MAP[activeTab] || 'adaptive-tutor';
  const [skill, setSkill] = useState(suggestedSkill);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mapped = TAB_SKILL_MAP[activeTab];
    if (mapped && mapped !== skill) { setSkill(mapped); setMessages([]); }
  }, [activeTab]);

  if (fullPage) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-extrabold mb-1">🤖 Ark AI Assistant</h1>
          <p className="text-purple-200 text-sm">Powered by Ark AI skills — your adaptive learning companion</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {SKILLS.map(s => (
            <button key={s.id} onClick={() => { setSkill(s.id); setMessages([]); }}
              className={`rounded-xl p-4 text-left border-2 transition-all hover:shadow-md ${
                skill === s.id ? `${s.color} text-white border-transparent shadow-md` : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className={`font-bold ${skill === s.id ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{s.label}</div>
              <div className={`text-xs mt-0.5 ${skill === s.id ? 'text-white/80' : 'text-gray-500'}`}>
                {s.id === 'adaptive-tutor' && 'Step-by-step personalised learning'}
                {s.id === 'math-assessment' && 'Homework help & problem solving'}
                {s.id === 'language-coach' && 'Vocabulary, grammar & conversation'}
                {s.id === 'build-lesson-plan' && 'Classroom-ready lesson plans'}
                {s.id === 'general' && 'Ask anything, learn anything'}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-3">
            <p className="text-white font-semibold text-sm">
              {SKILLS.find(s => s.id === skill)?.emoji} {SKILLS.find(s => s.id === skill)?.label} Mode
            </p>
          </div>
          <ChatPanel skill={skill} setSkill={setSkill} messages={messages} setMessages={setMessages}
            level={level} subject={subject} child={child} fullPage />
        </div>
      </div>
    );
  }

  // Floating mode
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        title="Open Ark AI Assistant">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        🤖 Ark AI
      </button>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-800 overflow-hidden">
          {/* Panel header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">🤖 Ark AI Assistant</p>
              {activeTab && TAB_SKILL_MAP[activeTab] && (
                <p className="text-purple-200 text-xs">Auto-matched to {activeTab}</p>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg leading-none">×</button>
          </div>
          <ChatPanel skill={skill} setSkill={setSkill} messages={messages} setMessages={setMessages}
            level={level} subject={subject} child={child} />
        </div>
      )}
    </>
  );
}
