import { useState, useEffect } from 'react';

const API = '/api';

function ReligionDetail({ religionId, onBack }) {
  const [religion, setReligion] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetch(`${API}/world-religions/${religionId}`).then(r => r.json()).then(setReligion);
  }, [religionId]);

  if (!religion) return <div className="p-4 text-gray-500">Loading…</div>;

  const TABS = [
    { id: 'overview', label: '📖 Overview' },
    { id: 'beliefs', label: '🙏 Beliefs' },
    { id: 'festivals', label: '🎉 Festivals' },
    { id: 'texts', label: '📚 Sacred Texts' },
    { id: 'contributions', label: '🏆 Contributions' },
    { id: 'comparisons', label: '🤝 Common Ground' },
    { id: 'lessons', label: `🎓 Lessons (${religion.lessons?.length || 0})` },
  ];

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-purple-700 hover:underline dark:text-purple-400">← All Religions</button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">{religion.emoji}</span>
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{religion.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{religion.adherents_approx} adherents · Founded {religion.founded} · Origin: {religion.origin}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 border-b pb-2 dark:border-gray-700">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`rounded px-3 py-1 text-sm font-medium transition ${activeTab === t.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-purple-600 dark:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 dark:bg-purple-900/20 dark:border-purple-700">
            <p className="text-sm text-gray-700 dark:text-gray-200">{religion.summary}</p>
          </div>
          {religion.history && (
            <div>
              <h3 className="font-semibold mb-3 dark:text-white">🕰️ Historical Timeline</h3>
              <div className="relative pl-4 border-l-2 border-purple-300 space-y-3 dark:border-purple-600">
                {religion.history.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-5 w-3 h-3 rounded-full bg-purple-400 mt-1"></div>
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-400">{h.year}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{h.event}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'beliefs' && religion.beliefs && (
        <div className="space-y-4">
          {Object.entries(religion.beliefs).map(([key, value]) => (
            <div key={key} className="rounded-xl border p-4 dark:border-gray-700">
              <h3 className="font-semibold capitalize mb-2 dark:text-white">{key.replace(/_/g, ' ')}</h3>
              {Array.isArray(value) ? (
                <ul className="space-y-1">
                  {value.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-purple-400">•</span>{item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'festivals' && religion.festivals && (
        <div className="space-y-3">
          {religion.festivals.map((f, i) => (
            <div key={i} className="rounded-xl border-l-4 border-purple-400 bg-purple-50 p-4 dark:bg-purple-900/20 dark:border-purple-500">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">🎉 {f.name}</h3>
                {f.arabic && <span className="text-sm text-gray-500 font-arabic dark:text-gray-400">{f.arabic}</span>}
              </div>
              <p className="text-xs text-purple-700 mb-1 dark:text-purple-400">🗓️ {f.timing}</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{f.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'texts' && religion.sacred_texts && (
        <div className="space-y-3">
          {religion.sacred_texts.map((t, i) => (
            <div key={i} className="rounded-xl border p-4 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">📖 {t.name}</h3>
              <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">{t.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contributions' && religion.cultural_contributions && (
        <div>
          <h3 className="font-semibold mb-3 dark:text-white">Cultural & Intellectual Contributions</h3>
          <ul className="space-y-2">
            {religion.cultural_contributions.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-yellow-500 flex-shrink-0">⭐</span>{c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'comparisons' && religion.respectful_comparisons && (
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            ℹ️ These comparisons highlight shared human values across faiths. Each religion is distinct and unique.
          </div>
          {Object.entries(religion.respectful_comparisons).filter(([k]) => k !== 'note').map(([key, value]) => (
            <div key={key} className="rounded-xl border p-4 dark:border-gray-700">
              <h3 className="font-semibold capitalize mb-2 text-green-700 dark:text-green-400">
                🤝 {key.replace(/common_ground_with_/, 'Common ground with ').replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
            </div>
          ))}
          {religion.respectful_comparisons.note && (
            <p className="text-xs text-gray-500 italic dark:text-gray-400">{religion.respectful_comparisons.note}</p>
          )}
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
          <ol className="max-h-[62vh] space-y-1 overflow-y-auto pr-1">
            {(religion.lessons || []).map((lesson, index) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full rounded-lg border p-2 text-left text-sm dark:border-gray-700 ${
                    (selectedLesson?.id || religion.lessons?.[0]?.id) === lesson.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2 text-xs opacity-60">{index + 1}.</span>{lesson.title}
                </button>
              </li>
            ))}
          </ol>
          {(() => {
            const lesson = selectedLesson || religion.lessons?.[0];
            if (!lesson) return <p>No lessons available.</p>;
            return (
              <article className="rounded-xl border p-5 dark:border-gray-700">
                <h3 className="text-xl font-bold">{lesson.title}</h3>
                <p className="mt-3 whitespace-pre-line leading-7">{lesson.explanation}</p>
                {lesson.example && <p className="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-950"><strong>Case study:</strong> {lesson.example}</p>}
                {lesson.exercise && <p className="mt-3"><strong>Applied task:</strong> {lesson.exercise}</p>}
                {lesson.video && <a href={lesson.video} target="_blank" rel="noreferrer" className="mt-4 inline-block font-medium text-purple-600 underline">Watch university-level video resources →</a>}
              </article>
            );
          })()}
        </div>
      )}

      {religion.links && (
        <div className="mt-6 flex gap-3">
          {religion.links.reference && (
            <a href={religion.links.reference} target="_blank" rel="noopener noreferrer"
              className="text-sm text-purple-600 underline">BBC Bitesize →</a>
          )}
          {religion.links.video && (
            <a href={religion.links.video} target="_blank" rel="noopener noreferrer"
              className="text-sm text-purple-600 underline">Video Search →</a>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorldReligions() {
  const [overview, setOverview] = useState(null);
  const [selectedReligion, setSelectedReligion] = useState(null);

  useEffect(() => {
    fetch(`${API}/world-religions`).then(r => r.json()).then(setOverview);
  }, []);

  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  if (selectedReligion) return (
    <div className="max-w-3xl mx-auto p-4">
      <ReligionDetail religionId={selectedReligion} onBack={() => setSelectedReligion(null)} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-purple-800 mb-1 dark:text-purple-300">🕌 World Religions</h1>
      {overview.disclaimer && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          ℹ️ {overview.disclaimer}
        </div>
      )}
      <p className="text-gray-500 mb-6 dark:text-gray-400">{overview.description}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overview.religions.map(rel => (
          <button key={rel.id} onClick={() => setSelectedReligion(rel.id)}
            className="text-left rounded-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 p-5 hover:shadow-lg hover:border-purple-400 transition-shadow dark:border-purple-700 dark:from-gray-800 dark:to-gray-900">
            <p className="text-4xl mb-2">{rel.emoji}</p>
            <p className="font-bold text-gray-800 dark:text-white">{rel.name}</p>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{rel.adherents_approx} adherents</p>
            <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">Founded {rel.founded}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
