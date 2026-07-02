import { useState, useEffect } from 'react';

const API = '/api';
const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];

function LevelView({ pathway, level, colour, onBack }) {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    fetch(`${API}/practical-skills/${pathway}/${level}`).then(r => r.json()).then(setData);
  }, [pathway, level]);
  if (!data) return <div className="p-4 text-gray-500">Loading…</div>;
  const quiz = data.quiz || [];
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← Back</button>
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{data.label}</h2>
        {data.certificate && (
          <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: colour }}>
            🏅 {data.certificate}
          </span>
        )}
      </div>
      <div className="space-y-4 mb-8">
        {data.skills?.map((skill, i) => (
          <div key={skill.id} className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ backgroundColor: colour }}>{i + 1}</div>
              <div>
                <p className="font-semibold text-gray-800">{skill.title}</p>
                <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                {skill.why && <p className="text-xs text-green-600 mt-1 italic">Why: {skill.why}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {quiz.length > 0 && (
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Check</h3>
          <div className="space-y-4">
            {quiz.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
                <div className="space-y-1">
                  {q.options.map((opt, j) => {
                    let cls = 'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer ';
                    if (!submitted) cls += answers[i] === j ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50';
                    else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
                    else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
                    else cls += 'border-gray-100 text-gray-400';
                    return (
                      <label key={j} className={cls}>
                        <input type="radio" name={`q${i}`} checked={answers[i] === j}
                          onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                          className="accent-indigo-500" />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < quiz.length}
              className="mt-4 px-5 py-2 text-white text-sm rounded-lg disabled:opacity-50"
              style={{ backgroundColor: colour }}>
              Submit
            </button>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-center">
              <p className="font-bold text-green-700 text-lg">{score}/{quiz.length}</p>
              <p className="text-gray-600 text-sm">{score === quiz.length ? '🎉 Level complete!' : '📖 Review the skills and try again!'}</p>
              <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-green-600 underline mt-1">Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PathwayView({ pathway, onBack }) {
  const [data, setData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  useEffect(() => {
    fetch(`${API}/practical-skills/${pathway.id}`).then(r => r.json()).then(setData);
  }, [pathway.id]);

  const colour = { cooking: '#f59e0b', first_aid: '#ef4444', financial_literacy: '#10b981' }[pathway.id] || '#6366f1';

  if (selectedLevel) return (
    <LevelView pathway={pathway.id} level={selectedLevel} colour={colour} onBack={() => setSelectedLevel(null)} />
  );

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← All Pathways</button>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{pathway.emoji}</span>
        <h2 className="text-2xl font-bold text-gray-800">{pathway.label}</h2>
      </div>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-3 gap-4">
          {LEVEL_ORDER.filter(l => data.levels && l in data.levels).map((level) => {
            const lv = data.levels[level];
            return (
              <button key={level} onClick={() => setSelectedLevel(level)}
                className="text-left rounded-xl border-2 p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: colour }}>
                <p className="font-bold text-gray-800 capitalize">{level}</p>
                <p className="text-xs text-gray-500 mt-1">{lv.label}</p>
                {lv.certificate && <p className="text-xs mt-2 font-medium" style={{ color: colour }}>🏅 {lv.certificate}</p>}
                <p className="text-xs text-gray-400 mt-1">{lv.skills?.length || 0} skills · {lv.quiz?.length || 0} quiz Qs</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PracticalSkills() {
  const [overview, setOverview] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  useEffect(() => { fetch(`${API}/practical-skills`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedPathway) return <div className="max-w-3xl mx-auto p-4"><PathwayView pathway={selectedPathway} onBack={() => setSelectedPathway(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🛠️ Practical Skills Academy</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {overview.pathways.map(pw => (
          <button key={pw.id} onClick={() => setSelectedPathway(pw)}
            className="text-left rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{pw.emoji}</p>
            <p className="font-bold text-gray-800">{pw.label}</p>
            <p className="text-xs text-gray-500 mt-1">{pw.level_count} levels</p>
          </button>
        ))}
      </div>
    </div>
  );
}
