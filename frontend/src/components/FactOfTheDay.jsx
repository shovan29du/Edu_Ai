import React, { useMemo } from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import { SpeakButton } from '../utils/tts.jsx';

function dayIndex() {
  const start = new Date(2024, 0, 1);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function FactOfTheDay({ grade }) {
  const { isRestricted } = useChild();

  const facts = useMemo(() => {
    if (!grade?.subjects) return [];
    const all = [];
    for (const [subjectName, subject] of Object.entries(grade.subjects)) {
      for (const card of subject.info_cards || []) {
        if (!isRestricted || isResourceSafe(card)) {
          all.push({ ...card, subjectName });
        }
      }
    }
    return all;
  }, [grade, isRestricted]);

  if (facts.length === 0) return null;

  const fact = facts[dayIndex() % facts.length];

  return (
    <section
      aria-label="Fact of the day"
      className="rounded border bg-purple-50 p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-2 text-lg font-bold">🌟 Fact of the Day</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{fact.subjectName}</p>
      <div className="flex items-start gap-2">
        <p className="font-medium flex-1">{fact.title}</p>
        <SpeakButton text={`${fact.title}. ${fact.fact}`} lang="en" />
      </div>
      <p className="text-gray-700 dark:text-gray-300">{fact.fact}</p>
    </section>
  );
}
