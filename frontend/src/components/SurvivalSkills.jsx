import { useState, useEffect } from 'react';

const API = '/api';

function QuizBlock({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!quiz?.length) return null;
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div className="mt-5 border-t pt-4">
      <h4 className="font-semibold text-gray-700 mb-3">Quick Check</h4>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3">
          <p className="text-sm font-medium mb-1">{i + 1}. {q.q}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => {
              let cls = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ';
              if (!submitted) cls += answers[i] === j ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
              else cls += 'border-gray-100 text-gray-400';
              return (
                <label key={j} className={cls}>
                  <input type="radio" name={`sq${i}`} checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-green-600" />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.length}
          className="mt-2 px-5 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 text-center">
          <p className="font-bold text-green-700">{score}/{quiz.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-green-600 underline mt-1">Retry</button>
        </div>
      )}
    </div>
  );
}

function SkillDetail({ categoryId, skillId, onBack }) {
  const [skill, setSkill] = useState(null);
  useEffect(() => {
    fetch(`${API}/survival-skills/${categoryId}/${skillId}`).then(r => r.json()).then(setSkill);
  }, [categoryId, skillId]);
  if (!skill) return <div className="p-4 text-gray-500">Loading…</div>;
  const levelColor = { beginner: 'green', intermediate: 'amber', advanced: 'red' }[skill.level] || 'gray';
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-green-700 hover:underline">← Back</button>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{skill.title}</h2>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${levelColor}-100 text-${levelColor}-700 capitalize`}>{skill.level}</span>
      </div>
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-4">
        <p className="text-sm text-gray-800">{skill.description}</p>
      </div>
      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 mb-4">
        <h3 className="font-semibold text-stone-800 mb-3">📋 Step-by-Step</h3>
        <ol className="space-y-2">
          {skill.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      {skill.key_rules?.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Key Rules</h3>
          <ul className="space-y-1">
            {skill.key_rules.map((rule, i) => (
              <li key={i} className="text-sm text-red-900 flex gap-2"><span>•</span>{rule}</li>
            ))}
          </ul>
        </div>
      )}
      <QuizBlock quiz={skill.quiz} />
    </div>
  );
}

function CategoryView({ cat, catId, onBack }) {
  const [data, setData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  useEffect(() => {
    fetch(`${API}/survival-skills/${catId}`).then(r => r.json()).then(setData);
  }, [catId]);
  if (selectedSkill) return <SkillDetail categoryId={catId} skillId={selectedSkill} onBack={() => setSelectedSkill(null)} />;
  const levelBadge = lvl => ({ beginner: 'bg-green-100 text-green-700', intermediate: 'bg-amber-100 text-amber-700', advanced: 'bg-red-100 text-red-700' }[lvl] || 'bg-gray-100 text-gray-600');
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-green-700 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-4">{cat.emoji} {cat.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {data.skills?.map(skill => (
            <button key={skill.id} onClick={() => setSelectedSkill(skill.id)}
              className="w-full text-left rounded-xl border-2 border-green-200 bg-green-50 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{skill.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
                </div>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 capitalize ${levelBadge(skill.level)}`}>{skill.level}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SurvivalSkills() {
  const [overview, setOverview] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  useEffect(() => { fetch(`${API}/survival-skills`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedCat) return (
    <div className="max-w-3xl mx-auto p-4">
      <CategoryView cat={selectedCat} catId={selectedCat.id} onBack={() => setSelectedCat(null)} />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-800 mb-1">🏕️ Survival Skills Academy</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat)}
            className="text-left rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{cat.emoji}</p>
            <p className="font-bold text-gray-800">{cat.label}</p>
            <p className="text-xs text-green-700 mt-2">{cat.skill_count} skill{cat.skill_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
