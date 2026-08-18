import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useChild, isParentProfile } from '../contexts/ChildContext.jsx';
import { fetchProgress } from '../api/progress.js';
import ExportButton from './ExportButton.jsx';

export default function ProgressDashboard() {
  const { child } = useChild();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (isParentProfile(child)) {
      setProgress(null);
      return;
    }
    fetchProgress(child).then(setProgress).catch(() => setProgress(null));
  }, [child]);

  if (isParentProfile(child) || !progress) return null;

  const chartData = Object.entries(progress.scores || {}).map(([subject, score]) => ({
    subject,
    score,
  }));

  return (
    <section aria-label="Progress dashboard" className="rounded border p-4 dark:border-gray-700">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{child}'s Progress</h2>
        <span className="flex gap-2">
          <ExportButton
            url={`/api/progress/${child}/export?format=csv`}
            fallbackFilename={`${child}-progress.csv`}
            label="Export CSV"
          />
          <ExportButton
            url={`/api/progress/${child}/export?format=pdf`}
            fallbackFilename={`${child}-progress.pdf`}
            label="Export PDF"
          />
        </span>
      </div>
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
      {progress.lesson_streak > 0 && (
        <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
          🔥 {progress.lesson_streak}-day lesson streak
        </p>
      )}
    </section>
  );
}
