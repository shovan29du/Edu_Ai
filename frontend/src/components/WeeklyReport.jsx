import { useState, useEffect } from 'react';

const API = '/api';
const CHILDREN = ['Aliza', 'Saifan'];

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function WeeklyReport() {
  const [child, setChild] = useState(CHILDREN[0]);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [rRes, pRes, aRes] = await Promise.all([
      fetch(`${API}/parent/weekly-report/${child}`).then(r => r.json()),
      fetch(`${API}/progress/${child}`).then(r => r.json()),
      fetch(`${API}/parent/attendance/${child}/summary`).then(r => r.json()),
    ]);
    setReport(rRes);
    setProgress(pRes);
    setAttendance(aRes);
    setLoading(false);
  };

  useEffect(() => { load(); }, [child]);

  const badges = progress?.badges || [];
  const scores = progress?.scores || {};
  const scoreEntries = Object.entries(scores);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">📊 Weekly Report</h2>
      <p className="text-gray-500 text-sm mb-4">Summary of each child's learning activity.</p>

      {/* Child selector */}
      <div className="flex gap-2 mb-5">
        {CHILDREN.map(c => (
          <button key={c} onClick={() => setChild(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${child === c ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-center py-8">Loading…</p>}

      {!loading && report && (
        <>
          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Screen Time (7 days)" value={`${report.screen_time_7_days ?? '—'}m`} color="amber" />
            <StatCard label="Books Read" value={report.books_read ?? 0} color="blue" />
            <StatCard label="Attendance Rate" value={attendance ? `${attendance.attendance_rate}%` : '—'} color="green" />
            <StatCard label="Badges Earned" value={badges.length} color="purple" />
          </div>

          {/* Homework status */}
          {report.homework_summary && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">📝 Homework</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-700">✓ Done: {report.homework_summary.done ?? 0}</span>
                <span className="text-amber-700">⏳ Pending: {report.homework_summary.pending ?? 0}</span>
                <span className="text-red-600">✗ Overdue: {report.homework_summary.overdue ?? 0}</span>
              </div>
            </div>
          )}

          {/* Subject scores */}
          {scoreEntries.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">📚 Subject Scores</h3>
              <div className="space-y-2">
                {scoreEntries.map(([subj, score]) => (
                  <div key={subj} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-36 flex-shrink-0 truncate">{subj}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-purple-500 rounded-full h-2" style={{ width: `${Math.min(score, 100)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-purple-700 w-10 text-right">{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent reading */}
          {report.recent_reading?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">📖 Recent Reading</h3>
              <ul className="space-y-1">
                {report.recent_reading.slice(0, 5).map((entry, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400">{entry.date}</span>
                    <span>{entry.title || entry.book || '—'}</span>
                    {entry.pages && <span className="text-gray-400">({entry.pages} pages)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-2">🏅 Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200">{badge}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
