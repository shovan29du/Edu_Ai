import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress } from '../api/progress.js';

export default function ProgressDashboard() {
  const { child } = useChild();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchProgress(child).then(setProgress).catch(() => setProgress(null));
  }, [child]);

  if (!progress) return null;

  const chartData = Object.entries(progress.scores || {}).map(([subject, score]) => ({
    subject,
    score,
  }));

  return (
    <section aria-label="Progress dashboard" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">{child}'s Progress</h2>
      {chartData.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No progress recorded yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      )}
      <p className="mt-2">Badges: {progress.badges?.join(', ') || 'None yet'}</p>
    </section>
  );
}
