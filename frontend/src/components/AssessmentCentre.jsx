import React, { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { useChild } from '../contexts/ChildContext.jsx';

function HistoryPanel({ child, onRetake }) {
  const [attempts, setAttempts] = useState(null);

  useEffect(() => {
    fetch(`/api/assessment/${child}/history`)
      .then((r) => r.json())
      .then((d) => setAttempts(d.attempts || []))
      .catch(() => setAttempts([]));
  }, [child]);

  if (attempts === null) return <p className="text-sm text-gray-500">Loading history…</p>;
  if (attempts.length === 0) {
    return <p className="text-sm text-gray-500">No past assessments yet — take one above to start building a learning-profile history.</p>;
  }

  return (
    <div className="space-y-2">
      {attempts.map((a, i) => {
        const when = a.timestamp ? new Date(a.timestamp).toLocaleDateString() : '';
        return (
          <div key={i} className="rounded-lg border p-3 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-sm">{a.age_group}</span>
                {when && <span className="ml-2 text-xs text-gray-400">{when}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{a.score}/{a.total} ({a.percentage}%)</span>
                {a.badge && <span className="text-xs">🏅</span>}
              </div>
            </div>
            {a.areas_to_develop?.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Weak spots: {a.areas_to_develop.join(', ')}</span>
                <button
                  onClick={() => onRetake(a.age_group, a.weak_skills || [])}
                  className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                >
                  🎯 Retake these
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AssessmentCentre() {
  const { child } = useChild();
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historyKey, setHistoryKey] = useState(0); // bump to force HistoryPanel to refetch after a submit

  useEffect(() => {
    fetch('/api/assessment/age-groups')
      .then((r) => r.json())
      .then((d) => { setAgeGroups(d.age_groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function loadAssessment(groupId) {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setReport(null);
    const data = await fetch(`/api/assessment/${groupId}`).then((r) => r.json());
    setSelectedGroup(groupId);
    setAssessment(data);
    setLoading(false);
  }

  async function loadRetake(groupId, weakSkills) {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setReport(null);
    setShowHistory(false);
    const params = new URLSearchParams({ weak_skills: (weakSkills || []).join(',') });
    const data = await fetch(`/api/assessment/${groupId}/retake?${params}`).then((r) => r.json());
    setSelectedGroup(groupId);
    setAssessment(data);
    setLoading(false);
  }

  async function submitAssessment() {
    const res = await fetch(`/api/assessment/${child}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_group: selectedGroup, answers }),
    });
    const data = await res.json();
    setReport(data);
    setSubmitted(true);
    setHistoryKey((k) => k + 1);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 p-4 text-white">
        <h2 className="text-xl font-bold">🧪 Assessment Centre</h2>
        <p className="text-sm opacity-90">Discover your learning strengths</p>
        <p className="mt-1 text-xs opacity-75">Note: This is an educational exercise, not a clinical assessment.</p>
      </div>

      {!selectedGroup && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {ageGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => loadAssessment(g.id)}
                className="rounded-xl border-2 border-transparent bg-white p-4 text-left shadow hover:border-orange-400 transition dark:bg-gray-900"
              >
                <div className="text-2xl">{g.icon || '📋'}</div>
                <div className="mt-1 font-semibold">{g.label}</div>
                <div className="text-sm text-gray-500">{g.description}</div>
              </button>
            ))}
          </div>

          <div>
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              {showHistory ? '▾ Hide' : '▸ Show'} learning-profile history
            </button>
            {showHistory && (
              <div className="mt-2">
                <HistoryPanel key={historyKey} child={child} onRetake={loadRetake} />
              </div>
            )}
          </div>
        </>
      )}

      {selectedGroup && assessment && !submitted && (
        <div className="space-y-4">
          <button onClick={() => setSelectedGroup(null)} className="text-sm text-orange-500 hover:underline">← Choose Age Group</button>
          <h3 className="font-semibold text-lg">
            {assessment.label}
            {assessment.is_retake && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                🎯 Focus retake
              </span>
            )}
          </h3>

          {assessment.sections && assessment.sections.map((section, si) => (
            <div key={si} className="rounded-xl border p-4 space-y-3">
              <h4 className="font-semibold text-orange-600">{section.title}</h4>
              {section.questions && section.questions.map((q, qi) => {
                const key = `${si}-${qi}`;
                return (
                  <div key={qi} className="space-y-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1 text-sm ${answers[key] === oi ? 'bg-orange-100 dark:bg-orange-900' : ''}`}>
                          <input
                            type="radio"
                            name={key}
                            checked={answers[key] === oi}
                            onChange={() => setAnswers({ ...answers, [key]: oi })}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <button
            onClick={submitAssessment}
            className="rounded-lg bg-orange-500 px-6 py-2 text-white font-medium hover:bg-orange-600"
          >
            See My Results
          </button>
        </div>
      )}

      {submitted && report && (
        <div className="space-y-4">
          <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-4">
            <h3 className="font-bold text-lg">Your Learning Profile 🌟</h3>
            {typeof report.score === 'number' && typeof report.total === 'number' && report.total > 0 && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Score: <span className="font-semibold">{report.score}/{report.total}</span> ({report.percentage}%)
                {report.badge && <span className="ml-2 rounded-full bg-orange-200 px-2 py-0.5 text-xs dark:bg-orange-800">🏅 Badge earned!</span>}
              </p>
            )}
            {report.message && <p className="mt-1 text-sm">{report.message}</p>}
            {report.strengths && report.strengths.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-green-600">Strengths:</p>
                <ul className="mt-1 space-y-1">
                  {report.strengths.map((s, i) => <li key={i} className="text-sm">✅ {s}</li>)}
                </ul>
              </div>
            )}
            {report.areas_to_develop && report.areas_to_develop.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-blue-600">Areas to Explore:</p>
                <ul className="mt-1 space-y-1">
                  {report.areas_to_develop.map((a, i) => <li key={i} className="text-sm">📚 {a}</li>)}
                </ul>
              </div>
            )}
            {report.recommendations && (
              <div className="mt-3">
                <p className="font-semibold">Recommended Subjects:</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {report.recommendations.map((r, i) => (
                    <span key={i} className="rounded-full bg-orange-200 px-3 py-1 text-xs dark:bg-orange-800">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {report.weak_skills && report.weak_skills.length > 0 && (
              <button
                onClick={() => loadRetake(selectedGroup, report.weak_skills)}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                🎯 Retake just my weak spots
              </button>
            )}
            <button
              onClick={() => { setSelectedGroup(null); setSubmitted(false); setReport(null); }}
              className="rounded bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700"
            >
              Try Another Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
