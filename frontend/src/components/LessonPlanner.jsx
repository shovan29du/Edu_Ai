import { useEffect, useState } from 'react';
import LevelSelector from './LevelSelector.jsx';
import {
  deleteLessonPlan,
  generateLessonPlan,
  listLessonPlans,
  rescheduleLesson,
} from '../api/lessonPlanner.js';

const TODAY = new Date().toISOString().slice(0, 10);

export default function LessonPlanner({ ownerId, level: initialLevel = '1' }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [subject, setSubject] = useState('');
  const [termName, setTermName] = useState('');
  const [startDate, setStartDate] = useState(TODAY);
  const [lessonCount, setLessonCount] = useState(10);
  const [lessonsPerWeek, setLessonsPerWeek] = useState(3);
  const [level, setLevel] = useState(initialLevel);
  const [notes, setNotes] = useState('');

  function refresh() {
    if (!ownerId) return;
    setLoading(true);
    listLessonPlans(ownerId)
      .then(setPlans)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  async function handleGenerate(event) {
    event.preventDefault();
    if (!subject.trim() || !termName.trim() || !startDate) return;
    setGenerating(true);
    setError('');
    try {
      const plan = await generateLessonPlan({
        owner_id: ownerId,
        subject: subject.trim(),
        term_name: termName.trim(),
        start_date: startDate,
        lesson_count: Number(lessonCount) || 10,
        lessons_per_week: Number(lessonsPerWeek) || 3,
        level,
        notes,
      });
      setPlans((p) => [...p, plan]);
      setExpandedId(plan.id);
      setSubject('');
      setTermName('');
      setNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(planId) {
    setError('');
    try {
      await deleteLessonPlan(planId);
      setPlans((p) => p.filter((plan) => plan.id !== planId));
      if (expandedId === planId) setExpandedId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReschedule(planId, lessonId, newDate) {
    setError('');
    try {
      const updated = await rescheduleLesson(planId, lessonId, newDate);
      setPlans((p) => p.map((plan) => (plan.id === planId ? updated : plan)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold">AI Lesson Planner</h3>
        <p className="text-sm text-gray-500">
          Generate a sequential term plan for a subject, automatically scheduled across the week,
          then move any lesson to a different date.
        </p>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleGenerate} className="grid gap-3 rounded-xl border p-4 dark:border-gray-700 md:grid-cols-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject, e.g. Algebra"
          className="input"
        />
        <input
          value={termName}
          onChange={(e) => setTermName(e.target.value)}
          placeholder="Term name, e.g. Term 1"
          className="input"
        />
        <label className="flex items-center gap-2 text-sm">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input flex-1"
          />
        </label>
        <LevelSelector level={level} onChange={setLevel} />
        <label className="flex items-center gap-2 text-sm">
          Number of lessons
          <input
            type="number"
            min="1"
            max="40"
            value={lessonCount}
            onChange={(e) => setLessonCount(e.target.value)}
            className="input flex-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Lessons per week
          <input
            type="number"
            min="1"
            max="5"
            value={lessonsPerWeek}
            onChange={(e) => setLessonsPerWeek(e.target.value)}
            className="input flex-1"
          />
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes or constraints (optional)"
          rows={2}
          className="input md:col-span-2"
        />
        <button type="submit" disabled={generating || !subject.trim() || !termName.trim()} className="button md:col-span-2">
          {generating ? 'Generating…' : 'Generate lesson plan'}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading plans…</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-gray-500">No lesson plans yet.</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border p-4 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                  className="text-left font-semibold text-indigo-700 dark:text-indigo-300"
                >
                  {plan.subject} — {plan.term_name}
                </button>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{plan.lessons.length} lesson(s)</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan.id)}
                    className="rounded border px-2 py-1"
                  >
                    Delete plan
                  </button>
                </div>
              </div>
              {expandedId === plan.id && (
                <ul className="mt-3 space-y-2">
                  {plan.lessons.map((lesson) => (
                    <li key={lesson.id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{lesson.title}</strong>
                        <input
                          type="date"
                          value={lesson.date || ''}
                          onChange={(e) => handleReschedule(plan.id, lesson.id, e.target.value)}
                          aria-label={`Date for ${lesson.title}`}
                          className="input"
                        />
                      </div>
                      {lesson.objectives?.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 text-xs text-gray-600 dark:text-gray-300">
                          {lesson.objectives.map((objective, i) => <li key={i}>{objective}</li>)}
                        </ul>
                      )}
                      {lesson.content && <p className="mt-1 text-xs text-gray-500">{lesson.content}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
