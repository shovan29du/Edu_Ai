import { useState, useEffect } from 'react';

const API = '/api';

function QuizPanel({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  if (!quiz?.length) return null;
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold text-gray-700 mb-3">Quick Quiz</h4>
      <div className="space-y-4">
        {quiz.map((q, i) => (
          <div key={i}>
            <p className="text-sm font-medium mb-2">{i + 1}. {q.question}</p>
            <div className="space-y-1">
              {q.options.map((opt, j) => {
                let cls = 'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer ';
                if (!submitted) cls += answers[i] === j ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50';
                else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
                else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
                else cls += 'border-gray-100 text-gray-400';
                return (
                  <label key={j} className={cls}>
                    <input type="radio" name={`q${i}`} checked={answers[i] === j}
                      onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                      className="accent-blue-500" />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < quiz.length}
          className="mt-3 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >Check Answers</button>
      ) : (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
          <p className="font-bold text-blue-700 text-lg">{score}/{quiz.length}</p>
          <p className="text-gray-600 text-sm">{score === quiz.length ? '🎉 Excellent!' : '📚 Review the experiment and try again!'}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-blue-600 underline mt-1">Try again</button>
        </div>
      )}
    </div>
  );
}

function ExperimentDetail({ discipline, experimentId, colour, onBack }) {
  const [exp, setExp] = useState(null);
  useEffect(() => {
    fetch(`${API}/stem-lab/${discipline}/${experimentId}`)
      .then(r => r.json()).then(setExp);
  }, [discipline, experimentId]);
  if (!exp) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← Back to experiments</button>
      <div className="rounded-xl border-2 p-5" style={{ borderColor: colour }}>
        <div className="flex items-start gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{exp.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Grades {exp.grade_range} · {exp.duration_mins} min · {exp.difficulty}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">🛒 Materials</h3>
            <ul className="space-y-1">
              {exp.materials?.map((m, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-400">•</span>{m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">🔑 Key Concepts</h3>
            <div className="flex flex-wrap gap-1">
              {exp.key_concepts?.map(c => (
                <span key={c} className="px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600 capitalize">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Steps</h3>
          <ol className="space-y-2">
            {exp.steps?.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: colour }}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-1">🔬 What's happening?</h3>
          <p className="text-sm text-yellow-900">{exp.explanation}</p>
        </div>

        <QuizPanel quiz={exp.quiz} />
      </div>
    </div>
  );
}

function DisciplineView({ discipline, onBack }) {
  const [data, setData] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  useEffect(() => {
    fetch(`${API}/stem-lab/${discipline.id}`).then(r => r.json()).then(setData);
  }, [discipline.id]);

  if (selectedExp) return (
    <ExperimentDetail
      discipline={discipline.id}
      experimentId={selectedExp}
      colour={discipline.colour}
      onBack={() => setSelectedExp(null)}
    />
  );

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← Back to STEM Lab</button>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-4xl">{discipline.emoji}</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{discipline.label}</h2>
          <p className="text-gray-500 text-sm">{discipline.description}</p>
        </div>
      </div>
      {!data ? <p className="mt-4 text-gray-400">Loading experiments…</p> : (
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {data.experiments?.map(exp => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp.id)}
              className="text-left rounded-xl border-2 p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: discipline.colour }}
            >
              <p className="font-bold text-gray-800">{exp.title}</p>
              <p className="text-xs text-gray-500 mt-1">Grades {exp.grade_range} · {exp.duration_mins} min</p>
              <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${exp.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {exp.difficulty}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StemLab() {
  const [overview, setOverview] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(null);

  useEffect(() => {
    fetch(`${API}/stem-lab`).then(r => r.json()).then(setOverview);
  }, []);

  if (!overview) return <div className="p-8 text-center text-gray-500">Loading STEM Lab…</div>;

  if (selectedDisc) return (
    <div className="max-w-3xl mx-auto p-4">
      <DisciplineView discipline={selectedDisc} onBack={() => setSelectedDisc(null)} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🔬 STEM Laboratory</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overview.disciplines.map(disc => (
          <button
            key={disc.id}
            onClick={() => setSelectedDisc(disc)}
            className="text-left rounded-xl border-2 p-4 hover:shadow-lg transition-shadow"
            style={{ borderColor: disc.colour, backgroundColor: disc.colour + '15' }}
          >
            <p className="text-3xl mb-2">{disc.emoji}</p>
            <p className="font-bold text-gray-800">{disc.label}</p>
            <p className="text-xs text-gray-500 mt-1">{disc.description}</p>
            <p className="text-xs font-medium mt-2" style={{ color: disc.colour }}>{disc.experiment_count} experiment{disc.experiment_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
