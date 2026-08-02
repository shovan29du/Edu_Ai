import { useState, useEffect } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API = '/api';

function SkillDetail({ skill, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const quiz = skill.quiz || [];

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-green-700 hover:underline">← Back</button>
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Grades {skill.grade_range}</span>
          {skill.adult_supervision_required && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">👨‍👩‍👧 Adult supervision required</span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{skill.name}</h2>
        <SpeakButton text={skill.name} lang="en" />
      </div>

      {skill.learning_objectives?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Learning Objectives</h3>
          <ul className="space-y-1">
            {skill.learning_objectives.map((o, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700"><span className="text-green-600">✓</span>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {skill.key_steps?.length > 0 && (
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 mb-4">
          <h3 className="font-semibold text-stone-800 mb-3">📋 Key Steps</h3>
          <ol className="space-y-2">
            {skill.key_steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {skill.practice_activities?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">🎯 Practice Activities</h3>
          <ul className="space-y-1">
            {skill.practice_activities.map((a, i) => (
              <li key={i} className="text-sm text-blue-900 flex gap-2"><span>•</span>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {skill.lesson_text && (
        <div className="rounded-xl bg-white border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📖 Full Lesson</h3>
          <div className="space-y-3">
            {skill.lesson_text.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      )}

      {skill.important_note && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Important Note</p>
          <p className="text-sm text-amber-900">{skill.important_note}</p>
        </div>
      )}

      {skill.links && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">🔗 Resources</h3>
          <div className="flex flex-wrap gap-2">
            {skill.links.video_link && (
              <a href={skill.links.video_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
                🎬 Watch Video
              </a>
            )}
            {skill.links.video_search_general && (
              <a href={skill.links.video_search_general} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
                ▶ More Videos
              </a>
            )}
            {skill.links.text_link && (
              <a href={skill.links.text_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                📖 Read Guide
              </a>
            )}
            {skill.links.resource_link && (
              <a href={skill.links.resource_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors">
                🌐 More Resources
              </a>
            )}
          </div>
        </div>
      )}

      {quiz.length > 0 && (
        <div className="border-t pt-5">
          <h4 className="font-semibold text-gray-700 mb-3">Quick Check</h4>
          <div className="space-y-4">
            {quiz.map((q, i) => (
              <div key={i} className="rounded-xl border p-4">
                <p className="text-sm font-medium mb-2">{i + 1}. {q.q}</p>
                {submitted ? (
                  <div className="p-2 rounded bg-green-50 text-sm text-green-800">
                    <strong>Answer:</strong> {q.a}
                    {answers[i] && <div className="mt-1 text-gray-500"><strong>Your answer:</strong> {answers[i]}</div>}
                  </div>
                ) : (
                  <textarea rows={2} className="w-full text-sm border rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Type your answer…"
                    value={answers[i] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)}
              className="mt-3 px-5 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800">
              Check Answers
            </button>
          ) : (
            <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-center">
              <p className="text-green-700 text-sm font-medium">🎉 Skill complete! Well done.</p>
              <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-green-600 underline mt-1">Review again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryView({ cat, catId, onBack }) {
  const [data, setData] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  useEffect(() => {
    fetch(`${API}/survival-skills/${catId}`).then(r => r.json()).then(setData);
  }, [catId]);

  if (selectedSkill) return <SkillDetail skill={selectedSkill} onBack={() => setSelectedSkill(null)} />;

  const skills = data?.skills || [];
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-green-700 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-4">{cat.emoji} {cat.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {skills.map((skill, i) => (
            <button key={i} onClick={() => setSelectedSkill(skill)}
              className="w-full text-left rounded-xl border-2 border-green-200 bg-green-50 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{skill.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-green-700">Grades {skill.grade_range}</span>
                    {skill.adult_supervision_required && <span className="text-xs text-amber-600">👨‍👩‍👧 Adult needed</span>}
                  </div>
                </div>
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
      <p className="text-gray-500 mb-6">{overview.description || 'Essential life and safety skills for every child.'}</p>
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
