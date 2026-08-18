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
              if (!submitted) cls += answers[i] === j ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
              else cls += 'border-gray-100 text-gray-400';
              return (
                <label key={j} className={cls}>
                  <input type="radio" name={`cv${i}`} checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-indigo-600" />
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
          className="mt-2 px-5 py-2 bg-indigo-700 text-white text-sm rounded-lg hover:bg-indigo-800 disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
          <p className="font-bold text-indigo-700">{score}/{quiz.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-indigo-600 underline mt-1">Retry</button>
        </div>
      )}
    </div>
  );
}

function LessonDetail({ moduleId, lessonId, onBack }) {
  const [lesson, setLesson] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    fetch(`${API}/civics/${moduleId}/${lessonId}`).then(r => r.json()).then(setLesson);
  }, [moduleId, lessonId]);
  if (!lesson) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-indigo-700 hover:underline">← Back</button>
      <div className="flex items-start gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{lesson.title}</h2>
        <SpeakButton text={`${lesson.title}. ${lesson.explanation}`} lang="en" />
      </div>
      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 mb-4">
        <h3 className="font-semibold text-indigo-800 mb-2">📖 Explanation</h3>
        <p className="text-sm text-gray-800 whitespace-pre-line">{lesson.explanation}</p>
      </div>
      {lesson.example && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Real Example</h3>
          <p className="text-sm text-gray-800 whitespace-pre-line">{lesson.example}</p>
        </div>
      )}
      {lesson.exercise && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <h3 className="font-semibold text-amber-800 mb-2">✍️ Think & Discuss</h3>
          <p className="text-sm text-gray-800">{lesson.exercise}</p>
          <button onClick={() => setShowAnswer(a => !a)} className="mt-2 text-xs text-amber-700 underline">
            {showAnswer ? 'Hide answer' : 'Show suggested answer'}
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
    fetch(`${API}/civics/${mod.id}`).then(r => r.json()).then(setData);
  }, [mod.id]);
  if (selectedLesson) return <LessonDetail moduleId={mod.id} lessonId={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-indigo-700 hover:underline">← All Modules</button>
      <h2 className="text-2xl font-bold mb-1">{mod.emoji} {mod.label}</h2>
      <p className="text-gray-500 text-sm mb-4">{mod.description}</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {data.lessons?.map((lesson, i) => (
            <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)}
              className="w-full text-left rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-700 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-gray-800">{lesson.title}</p>
                  <p className="text-xs text-indigo-600 mt-0.5">{lesson.quiz?.length || 0} quiz questions</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Civics() {
  const [overview, setOverview] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  useEffect(() => { fetch(`${API}/civics`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedMod) return <div className="max-w-3xl mx-auto p-4"><ModuleView mod={selectedMod} onBack={() => setSelectedMod(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-indigo-800 mb-1">🗳️ Civics & Citizenship</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.modules.map(mod => (
          <button key={mod.id} onClick={() => setSelectedMod(mod)}
            className="text-left rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{mod.emoji}</p>
            <p className="font-bold text-gray-800">{mod.label}</p>
            <p className="text-xs text-gray-500 mt-1">{mod.description}</p>
            <p className="text-xs text-indigo-600 mt-2">{mod.lesson_count} lesson{mod.lesson_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
