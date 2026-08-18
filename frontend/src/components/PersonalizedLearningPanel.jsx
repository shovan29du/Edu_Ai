import React, { useEffect, useState } from 'react';
import { fetchPersonalizedProfile } from '../api/personalized.js';

function masteryTone(value) {
  if (value >= 80) return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
  if (value >= 55) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
  return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100';
}

export default function PersonalizedLearningPanel({ profile, levelId, subject, onSelectLesson }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => {
      fetchPersonalizedProfile(profile, levelId, subject)
        .then((result) => {
          if (active) {
            setData(result);
            setError('');
          }
        })
        .catch(() => active && setError('Building your personalised plan… check back in a moment! 🌟'));
    };
    load();
    const handleUpdate = (event) => {
      const detail = event.detail || {};
      if (detail.profile === profile && String(detail.levelId) === String(levelId) && detail.subject === subject) {
        load();
      }
    };
    window.addEventListener('personalized-learning-updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('personalized-learning-updated', handleUpdate);
    };
  }, [profile, levelId, subject]);

  if (error) return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200 flex items-center gap-2">
      <span className="text-xl">🌟</span> {error}
    </div>
  );
  if (!data) return (
    <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-200 flex items-center gap-2 animate-pulse">
      <span className="text-xl">🔭</span> Building your personalised learning map…
    </div>
  );
  const knowledgeMap = data.knowledge_map || [];
  const misconceptions = data.repeated_misconceptions || [];

  return (
    <section className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">🎯 Your Personalised Learning Path</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ⭐ You know {data.overall_mastery_percent ?? 25}% · {data.reviews_due ?? 0} topic{data.reviews_due === 1 ? '' : 's'} to revisit
          </p>
        </div>
        {data.next_lesson && (
          <button
            type="button"
            onClick={() => onSelectLesson?.(data.next_lesson.lesson_id)}
            className="rounded bg-indigo-600 px-3 py-2 text-left text-sm font-semibold text-white"
          >
            Next: {data.next_lesson.lesson_title}
            <span className="block text-xs font-normal">{data.next_lesson.reason}</span>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Knowledge map">
        {knowledgeMap.slice(0, 16).map((concept) => (
          <span
            key={concept.concept_key}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${masteryTone(concept.mastery_percent)}`}
            title={`${concept.concept_name}: ${concept.mastery_percent}% mastery`}
          >
            {concept.concept_name} · {concept.mastery_percent}%
          </span>
        ))}
      </div>

      {misconceptions.length > 0 && (
        <div className="mt-4 rounded border border-orange-300 bg-white/60 p-3 text-sm dark:bg-gray-900/40">
          <p className="font-semibold">Patterns to revisit</p>
          <ul className="mt-1 list-disc pl-5">
            {misconceptions.slice(0, 3).map((item) => (
              <li key={`${item.concept}-${item.key}`}>
                {item.concept}: “{item.answer || 'incorrect response'}” occurred {item.count} times
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
