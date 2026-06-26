import React, { useEffect, useState } from 'react';
import { fetchProgress } from '../api/progress.js';

const CHILDREN = ['Aliza', 'Saifan'];

export default function ParentProgressOverview() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    CHILDREN.forEach((child) => {
      fetchProgress(child)
        .then((data) => setProgress((prev) => ({ ...prev, [child]: data })))
        .catch(() => setProgress((prev) => ({ ...prev, [child]: null })));
    });
  }, []);

  return (
    <section aria-label="Children's progress overview" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Children's Progress</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CHILDREN.map((child) => {
          const data = progress[child];
          const scores = data?.scores || {};
          const badges = data?.badges || [];
          return (
            <div key={child} className="rounded border p-3 dark:border-gray-700">
              <h3 className="mb-2 font-semibold">{child}</h3>
              {Object.keys(scores).length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">No exam scores yet.</p>
              ) : (
                <ul className="mb-2 space-y-1 text-sm">
                  {Object.entries(scores).map(([subject, score]) => (
                    <li key={subject}>
                      {subject}: {score}%
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Badges: {badges.length > 0 ? badges.join(', ') : 'None yet'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
