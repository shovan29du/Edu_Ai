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
      <h4 className="font-semibold text-gray-700 mb-3">Quick Check</h4>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3">
          <p className="text-sm font-medium mb-1">{i + 1}. {q.q}</p>
          <div className="space-y-1">
            {q.options.map((opt, j) => {
              let cls = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ';
              if (!submitted) cls += answers[i] === j ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
              else cls += 'border-gray-100 text-gray-400';
              return (
                <label key={j} className={cls}>
                  <input type="radio" name={`bs${i}`} checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-emerald-600" />
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
          className="mt-2 px-5 py-2 bg-emerald-700 text-white text-sm rounded-lg hover:bg-emerald-800 disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <p className="font-bold text-emerald-700">{score}/{quiz.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-emerald-600 underline mt-1">Retry</button>
        </div>
      )}
    </div>
  );
}

function LessonDetail({ moduleId, lessonId, onBack }) {
  const [lesson, setLesson] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    fetch(`${API}/business-studies/${moduleId}/${lessonId}`).then(r => r.json()).then(setLesson);
  }, [moduleId, lessonId]);
  if (!lesson) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-emerald-700 hover:underline">← Back</button>
      <div className="flex items-start gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{lesson.title}</h2>
        <SpeakButton text={`${lesson.title}. ${lesson.explanation}`} lang="en" />
      </div>
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-4">
        <h3 className="font-semibold text-emerald-800 mb-2">📖 Key Concepts</h3>
        <p className="text-sm text-gray-800 whitespace-pre-line">{lesson.explanation}</p>
      </div>
      {lesson.example && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 mb-4">
          <h3 className="font-semibold text-teal-800 mb-2">🏢 Real-World Example</h3>
          <p className="text-sm text-gray-800 whitespace-pre-line">{lesson.example}</p>
        </div>
      )}
      {lesson.exercise && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <h3 className="font-semibold text-amber-800 mb-2">✍️ Practice Question</h3>
          <p className="text-sm text-gray-800">{lesson.exercise}</p>
          <button onClick={() => setShowAnswer(a => !a)}
            className="mt-2 text-xs text-amber-700 underline">
            {showAnswer ? 'Hide answer' : 'Show answer'}
          </button>
          {showAnswer && lesson.exercise_answer && (
            <p className="mt-2 text-sm text-amber-900 border-t border-amber-200 pt-2">{lesson.exercise_answer}</p>
          )}
        </div>
      )}
      <QuizBlock quiz={lesson.quiz} />
    </div>
  );
}

function ModuleView({ mod, onBack }) {
  const [data, setData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  useEffect(() => {
    fetch(`${API}/business-studies/${mod.id}`).then(r => r.json()).then(setData);
  }, [mod.id]);
  if (selectedLesson) return <LessonDetail moduleId={mod.id} lessonId={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-emerald-700 hover:underline">← All Modules</button>
      <h2 className="text-2xl font-bold mb-1">{mod.emoji} {mod.label}</h2>
      <p className="text-gray-500 text-sm mb-4">{mod.description}</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {data.lessons?.map((lesson, i) => (
            <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)}
              className="w-full text-left rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-gray-800">{lesson.title}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{lesson.quiz?.length || 0} quiz questions</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessStudies() {
  const [overview, setOverview] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  useEffect(() => { fetch(`${API}/business-studies`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedMod) return <div className="max-w-3xl mx-auto p-4"><ModuleView mod={selectedMod} onBack={() => setSelectedMod(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-emerald-800 mb-1">💼 Business Studies</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.modules.map(mod => (
          <button key={mod.id} onClick={() => setSelectedMod(mod)}
            className="text-left rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{mod.emoji}</p>
            <p className="font-bold text-gray-800">{mod.label}</p>
            <p className="text-xs text-gray-500 mt-1">{mod.description}</p>
            <p className="text-xs text-emerald-700 mt-2">{mod.lesson_count} lesson{mod.lesson_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
