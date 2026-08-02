import { useState, useEffect } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API = '/api';

function QuizBlock({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!quiz?.length) return null;
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div className="mt-5 border-t pt-4">
      <h4 className="font-semibold text-gray-700 mb-3 dark:text-gray-200">Quick Check</h4>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3">
          <p className="text-sm font-medium mb-1 dark:text-gray-200">{i + 1}. {q.q}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => {
              let cls = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ';
              if (!submitted) cls += answers[i] === j ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40' : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600 dark:bg-red-900/40';
              else cls += 'border-gray-100 text-gray-400 dark:border-gray-700';
              return (
                <label key={j} className={cls}>
                  <input type="radio" name={`wp${i}`} checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-blue-600" />
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
          className="mt-2 px-5 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-center dark:bg-blue-900/20">
          <p className="font-bold text-blue-700 dark:text-blue-300">{score}/{quiz.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-blue-600 underline mt-1">Retry</button>
        </div>
      )}
    </div>
  );
}

function LessonDetail({ moduleId, lessonId, onBack }) {
  const [lesson, setLesson] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    fetch(`${API}/world-politics/${moduleId}/${lessonId}`).then(r => r.json()).then(setLesson);
  }, [moduleId, lessonId]);
  if (!lesson) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-blue-700 hover:underline">← Back</button>
      <div className="flex items-start gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex-1">{lesson.title}</h2>
        <SpeakButton text={`${lesson.title}. ${lesson.explanation}`} lang="en" />
      </div>
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4 dark:bg-blue-900/20 dark:border-blue-700">
        <h3 className="font-semibold text-blue-800 mb-2 dark:text-blue-300">📖 Explanation</h3>
        <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">{lesson.explanation}</p>
      </div>
      {lesson.example && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 mb-4 dark:bg-indigo-900/20 dark:border-indigo-700">
          <h3 className="font-semibold text-indigo-800 mb-2 dark:text-indigo-300">🌍 Real-World Example</h3>
          <p className="text-sm text-gray-800 whitespace-pre-line dark:text-gray-200">{lesson.example}</p>
        </div>
      )}
      {lesson.exercise && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4 dark:bg-amber-900/20 dark:border-amber-700">
          <h3 className="font-semibold text-amber-800 mb-2 dark:text-amber-300">✍️ Discussion Exercise</h3>
          <p className="text-sm text-gray-800 dark:text-gray-200">{lesson.exercise}</p>
          <button onClick={() => setShowAnswer(a => !a)}
            className="mt-2 text-xs text-amber-700 underline dark:text-amber-400">
            {showAnswer ? 'Hide answer' : 'Show suggested answer'}
          </button>
          {showAnswer && lesson.exercise_answer && (
            <p className="mt-2 text-sm text-amber-900 border-t border-amber-200 pt-2 dark:text-amber-200">{lesson.exercise_answer}</p>
          )}
        </div>
      )}
      <QuizBlock quiz={lesson.quiz} />
    </div>
  );
}

function CountryDetail({ countryId, onBack }) {
  const [country, setCountry] = useState(null);
  useEffect(() => {
    fetch(`${API}/world-politics/countries/${countryId}`).then(r => r.json()).then(setCountry);
  }, [countryId]);
  if (!country) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-blue-700 hover:underline">← Back to Countries</button>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">{country.flag}</span>
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{country.name}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{country.government_type}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <InfoCard label="🏛️ Capital" value={country.capital} />
        <InfoCard label="👤 Head of State" value={country.head_of_state_role} />
        <InfoCard label="🏛️ Legislature" value={country.legislature} />
        <InfoCard label="📌 Government Type" value={country.government_type} />
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4 dark:bg-blue-900/20 dark:border-blue-700">
        <h3 className="font-semibold text-blue-800 mb-2 dark:text-blue-300">🌍 Foreign Policy Overview</h3>
        <p className="text-sm text-gray-700 dark:text-gray-200">{country.foreign_policy_overview}</p>
      </div>

      {country.geopolitical_context && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 mb-4 dark:bg-indigo-900/20 dark:border-indigo-700">
          <h3 className="font-semibold text-indigo-800 mb-2 dark:text-indigo-300">⚡ Geopolitical Context</h3>
          <p className="text-sm text-gray-700 dark:text-gray-200">{country.geopolitical_context}</p>
        </div>
      )}

      {country.key_alliances?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2 dark:text-white">🤝 Key Alliances</h3>
          <div className="flex flex-wrap gap-2">
            {country.key_alliances.map((a, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{a}</span>
            ))}
          </div>
        </div>
      )}

      {country.international_organisations?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2 dark:text-white">🌐 International Organisations</h3>
          <div className="flex flex-wrap gap-2">
            {country.international_organisations.map((o, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">{o}</span>
            ))}
          </div>
        </div>
      )}

      {country.notable_policies?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2 dark:text-white">📋 Notable Policies</h3>
          <ul className="space-y-1">
            {country.notable_policies.map((p, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-blue-400">•</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {country.links && (
        <div className="flex gap-3 mt-4">
          {country.links.wikipedia && (
            <a href={country.links.wikipedia} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 underline">Wikipedia →</a>
          )}
          {country.links.video && (
            <a href={country.links.video} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 underline">Video →</a>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border p-3 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium mt-0.5 dark:text-gray-200">{value}</p>
    </div>
  );
}

function CountriesView({ onBack }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    fetch(`${API}/world-politics/countries`).then(r => r.json()).then(d => setCountries(d.countries || []));
  }, []);

  if (selectedCountry) return <CountryDetail countryId={selectedCountry} onBack={() => setSelectedCountry(null)} />;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-700 hover:underline">← All Modules</button>
      <h2 className="text-2xl font-bold mb-1 dark:text-white">🗺️ Country Profiles</h2>
      <p className="text-gray-500 text-sm mb-4 dark:text-gray-400">Government systems and international relations of key nations.</p>
      {!countries.length ? <p className="text-gray-400">Loading countries…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {countries.map(c => (
            <button key={c.id} onClick={() => setSelectedCountry(c.id)}
              className="text-left rounded-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 hover:shadow-md hover:border-blue-300 transition dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:border-blue-500">
              <div className="text-3xl mb-1">{c.flag}</div>
              <p className="font-bold text-gray-800 dark:text-white">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400 line-clamp-2">{c.government_type}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleView({ mod, onBack }) {
  const [data, setData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    if (mod.id === 'country_profiles') return;
    setData(null);
    fetch(`${API}/world-politics/${mod.id}`).then(r => r.json()).then(setData);
  }, [mod.id]);

  // Country profiles module handled separately
  if (mod.id === 'country_profiles') return <CountriesView onBack={onBack} />;

  if (selectedLesson) return <LessonDetail moduleId={mod.id} lessonId={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-700 hover:underline">← All Modules</button>
      <h2 className="text-2xl font-bold mb-1 dark:text-white">{mod.emoji} {mod.label}</h2>
      <p className="text-gray-500 text-sm mb-4 dark:text-gray-400">{mod.description}</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {data.lessons?.map((lesson, i) => (
            <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)}
              className="w-full text-left rounded-xl border-2 border-blue-200 bg-blue-50 p-4 hover:shadow-md transition-shadow dark:border-blue-700 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{lesson.title}</p>
                  <p className="text-xs text-blue-600 mt-0.5 dark:text-blue-300">{lesson.quiz?.length || 0} quiz questions</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldPolitics() {
  const [overview, setOverview] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  useEffect(() => { fetch(`${API}/world-politics`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedMod) return <div className="max-w-3xl mx-auto p-4"><ModuleView mod={selectedMod} onBack={() => setSelectedMod(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        Standards 9–10
      </div>
      <h1 className="text-3xl font-bold text-blue-800 mb-1 dark:text-blue-300">⚡ World Politics & International Relations</h1>
      {overview.disclaimer && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          ℹ️ {overview.disclaimer}
        </div>
      )}
      <p className="text-gray-500 mb-6 dark:text-gray-400">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.modules.map(mod => (
          <button key={mod.id} onClick={() => setSelectedMod(mod)}
            className="text-left rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 hover:shadow-lg transition-shadow dark:border-blue-700 dark:from-gray-800 dark:to-gray-900">
            <p className="text-3xl mb-2">{mod.emoji}</p>
            <p className="font-bold text-gray-800 dark:text-white">{mod.label}</p>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{mod.description}</p>
            <p className="text-xs text-blue-600 mt-2 dark:text-blue-400">{mod.lesson_count} {mod.id === 'country_profiles' ? 'countries' : `lesson${mod.lesson_count !== 1 ? 's' : ''}`}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
