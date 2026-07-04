import { useState, useEffect } from 'react';

const API = '/api';

const COLOURS = {
  cooking: '#f59e0b', first_aid: '#ef4444', financial_literacy: '#10b981',
  coding_scratch: '#8b5cf6', coding_python: '#3b82f6', typing: '#06b6d4',
  drawing: '#ec4899', painting: '#f97316', photography: '#64748b',
  public_speaking: '#eab308', study_skills: '#14b8a6', research_skills: '#a855f7',
  time_management: '#22c55e', gardening: '#84cc16', chess: '#78716c',
  exercise_fitness: '#f43f5e', yoga_mindfulness: '#6366f1', origami: '#0ea5e9',
  sewing_crafts: '#d97706',
};

function ModuleView({ module: mod, colour, onBack }) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const quiz = mod.quiz || [];
  const score = submitted ? quiz.filter((q, i) => quizAnswers[i] === q.a).length : 0;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← Back</button>
      <div className="mb-4">
        <span className="text-xs font-medium uppercase tracking-wide px-2 py-1 rounded" style={{ background: colour + '20', color: colour }}>
          {mod.level} · Grades {mod.grade_range}
        </span>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">{mod.title}</h2>
        <p className="text-gray-600 mt-1">{mod.description}</p>
        <p className="text-sm text-gray-500 mt-1">⏱ {mod.duration_minutes} minutes</p>
      </div>

      {mod.learning_objectives?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold text-gray-700 mb-2">Learning Objectives</h3>
          <ul className="space-y-1">
            {mod.learning_objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span style={{ color: colour }}>✓</span>{o}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mod.steps?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold text-gray-700 mb-2">Steps</h3>
          <ol className="space-y-2">
            {mod.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: colour }}>{i + 1}</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {mod.materials_needed?.length > 0 && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-sm font-semibold text-amber-700 mb-1">🧰 Materials Needed</p>
          <p className="text-sm text-amber-800">{mod.materials_needed.join(', ')}</p>
        </div>
      )}

      {mod.hands_on_activity && (
        <div className="mb-5 p-4 rounded-xl border-2" style={{ borderColor: colour, background: colour + '10' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: colour }}>🎯 Hands-On Activity</p>
          <p className="text-sm text-gray-700">{mod.hands_on_activity}</p>
        </div>
      )}

      {mod.pro_tip && (
        <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm font-semibold text-green-700 mb-1">💡 Pro Tip</p>
          <p className="text-sm text-green-800">{mod.pro_tip}</p>
        </div>
      )}

      {mod.links && (
        <div className="mb-5">
          <h3 className="font-semibold text-gray-700 mb-2">🔗 Resources</h3>
          <div className="flex flex-wrap gap-2">
            {mod.links.video_link && (
              <a href={mod.links.video_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
                🎬 Watch Video
              </a>
            )}
            {mod.links.video_search_general && (
              <a href={mod.links.video_search_general} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
                ▶ More Videos
              </a>
            )}
            {mod.links.text_link && (
              <a href={mod.links.text_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                📖 Read Guide
              </a>
            )}
            {mod.links.resource_link && (
              <a href={mod.links.resource_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors">
                🌐 More Resources
              </a>
            )}
          </div>
        </div>
      )}

      {quiz.length > 0 && (
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Check</h3>
          <div className="space-y-4">
            {quiz.map((q, i) => (
              <div key={i} className="rounded-xl border p-4">
                <p className="text-sm font-medium mb-3">{i + 1}. {q.q}</p>
                {submitted ? (
                  <div className="mt-2 p-2 rounded bg-green-50 text-sm text-green-800">
                    <strong>Answer:</strong> {q.a}
                    {quizAnswers[i] && <div className="mt-1 text-gray-600"><strong>Your answer:</strong> {quizAnswers[i]}</div>}
                  </div>
                ) : (
                  <textarea rows={2} className="w-full text-sm border rounded p-2 focus:outline-none focus:ring-1"
                    style={{ '--tw-ring-color': colour }}
                    placeholder="Type your answer…"
                    value={quizAnswers[i] || ''}
                    onChange={e => setQuizAnswers(a => ({ ...a, [i]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)}
              className="mt-4 px-5 py-2 text-white text-sm rounded-lg"
              style={{ backgroundColor: colour }}>
              Check Answers
            </button>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-center">
              <p className="text-green-700 text-sm font-medium">🎉 Module complete! Great work.</p>
              <button onClick={() => { setQuizAnswers({}); setSubmitted(false); }} className="text-xs text-green-600 underline mt-1">Review again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PathwayView({ pathway, onBack }) {
  const [data, setData] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  useEffect(() => {
    fetch(`${API}/practical-skills/${pathway.id}`).then(r => r.json()).then(setData);
  }, [pathway.id]);

  const colour = COLOURS[pathway.id] || '#6366f1';

  if (selectedModule) return (
    <div>
      <ModuleView module={selectedModule} colour={colour} onBack={() => setSelectedModule(null)} />
    </div>
  );

  const modules = data?.modules || [];

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← All Pathways</button>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{pathway.emoji}</span>
        <h2 className="text-2xl font-bold text-gray-800">{pathway.label}</h2>
      </div>
      {data?.description && <p className="text-gray-500 mb-4 text-sm">{data.description}</p>}
      {!data ? <p className="text-gray-400">Loading…</p> : (
        modules.length > 0 ? (
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <button key={i} onClick={() => setSelectedModule(mod)}
                className="w-full text-left rounded-xl border-2 p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: colour }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: colour }}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{mod.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{mod.description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: colour + '20', color: colour }}>{mod.level}</span>
                      <span className="text-xs text-gray-400">Grades {mod.grade_range}</span>
                      <span className="text-xs text-gray-400">⏱ {mod.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No modules available yet.</p>
        )
      )}
    </div>
  );
}

export default function PracticalSkills() {
  const [overview, setOverview] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  useEffect(() => { fetch(`${API}/practical-skills`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedPathway) return (
    <div className="max-w-3xl mx-auto p-4">
      <PathwayView pathway={selectedPathway} onBack={() => setSelectedPathway(null)} />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🛠️ Practical Skills Academy</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {overview.pathways.map(pw => {
          const colour = COLOURS[pw.id] || '#6366f1';
          const count = pw.module_count || pw.level_count || 0;
          return (
            <button key={pw.id} onClick={() => setSelectedPathway(pw)}
              className="text-left rounded-xl border-2 p-5 hover:shadow-lg transition-shadow"
              style={{ borderColor: colour }}>
              <p className="text-3xl mb-2">{pw.emoji || '📚'}</p>
              <p className="font-bold text-gray-800">{pw.label}</p>
              <p className="text-xs text-gray-500 mt-1">{count} {pw.module_count > 0 ? 'modules' : 'levels'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
