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
              if (!submitted) cls += answers[i] === j ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50';
              else if (j === q.answer) cls += 'border-green-500 bg-green-50 text-green-700';
              else if (answers[i] === j) cls += 'border-red-400 bg-red-50 text-red-600';
              else cls += 'border-gray-100 text-gray-400';
              return (
                <label key={j} className={cls}>
                  <input type="radio" name={`eq${i}`} checked={answers[i] === j}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [i]: j }))}
                    className="accent-teal-600" />
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
          className="mt-2 px-5 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
          Submit
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-teal-50 border border-teal-200 text-center">
          <p className="font-bold text-teal-700">{score}/{quiz.length}</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-xs text-teal-600 underline mt-1">Retry</button>
        </div>
      )}
    </div>
  );
}

function TopicDetail({ unitId, topicId, onBack }) {
  const [topic, setTopic] = useState(null);
  useEffect(() => {
    fetch(`${API}/environmental-science/${unitId}/${topicId}`).then(r => r.json()).then(setTopic);
  }, [unitId, topicId]);
  if (!topic) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-teal-700 hover:underline">← Back</button>
      <div className="flex items-start gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{topic.title}</h2>
        <SpeakButton text={`${topic.title}. ${topic.content || ''}`} lang="en" />
      </div>
      <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 mb-4">
        <p className="text-sm text-gray-800 whitespace-pre-line">{topic.content}</p>
      </div>
      {topic.key_facts?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">🌍 Key Facts</h3>
          <ul className="space-y-1">
            {topic.key_facts.map((fact, i) => (
              <li key={i} className="text-sm flex gap-2"><span className="text-blue-500">•</span>{fact}</li>
            ))}
          </ul>
        </div>
      )}
      <QuizBlock quiz={topic.quiz} />
    </div>
  );
}

function UnitView({ unit, unitId, onBack }) {
  const [data, setData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  useEffect(() => {
    fetch(`${API}/environmental-science/${unitId}`).then(r => r.json()).then(setData);
  }, [unitId]);
  if (selectedTopic) return <TopicDetail unitId={unitId} topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-teal-700 hover:underline">← All Units</button>
      <h2 className="text-2xl font-bold mb-4">{unit.emoji} {unit.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="space-y-3">
          {data.topics?.map((topic, i) => (
            <button key={topic.id} onClick={() => setSelectedTopic(topic.id)}
              className="w-full text-left rounded-xl border-2 border-teal-200 bg-teal-50 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-sm flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-gray-800">{topic.title}</p>
                  <p className="text-xs text-teal-600 mt-0.5">{topic.quiz?.length || 0} quiz question{topic.quiz?.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnvironmentalScience() {
  const [overview, setOverview] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  useEffect(() => { fetch(`${API}/environmental-science`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedUnit) return (
    <div className="max-w-3xl mx-auto p-4">
      <UnitView unit={selectedUnit} unitId={selectedUnit.id} onBack={() => setSelectedUnit(null)} />
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-teal-700 mb-1">🌱 Environmental Science</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.units.map(unit => (
          <button key={unit.id} onClick={() => setSelectedUnit(unit)}
            className="text-left rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-green-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{unit.emoji}</p>
            <p className="font-bold text-gray-800">{unit.label}</p>
            <p className="text-xs text-teal-600 mt-2">{unit.topic_count} topic{unit.topic_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
