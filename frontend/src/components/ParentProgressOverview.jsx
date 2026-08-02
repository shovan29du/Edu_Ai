import React, { useEffect, useState, useCallback } from 'react';
import { fetchProgress } from '../api/progress.js';

const API = '/api/parent';

const TABS = ['Progress', 'Homework', 'Reading Log', 'Screen Time', 'Weekly Report'];

export default function ParentProgressOverview() {
  const [activeTab, setActiveTab] = useState('Progress');
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then((d) => {
      const kids = (d.users || []).filter((u) => u.role === 'child').map((u) => u.name);
      setChildren(kids);
      setSelectedChild((prev) => prev ?? kids[0] ?? null);
    }).catch(() => {});
  }, []);

  return (
    <section aria-label="Parent Dashboard" className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <h2 className="text-xl font-bold">👩‍👧 Parent Dashboard</h2>
        <p className="text-sm opacity-90">Track progress, manage homework, and monitor learning</p>
      </div>

      {children.length === 0 ? (
        <p className="text-gray-400 text-sm">No child profiles yet — add one in the Users tab.</p>
      ) : (
        <div className="flex gap-2">
          {children.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedChild(c)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                selectedChild === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b pb-2 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded px-3 py-1 text-sm font-medium ${
              activeTab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Progress' && <ProgressTab child={selectedChild} />}
      {activeTab === 'Homework' && <HomeworkTab child={selectedChild} />}
      {activeTab === 'Reading Log' && <ReadingLogTab child={selectedChild} />}
      {activeTab === 'Screen Time' && <ScreenTimeTab child={selectedChild} />}
      {activeTab === 'Weekly Report' && <WeeklyReportTab child={selectedChild} />}
    </section>
  );
}

// ── Progress Tab ──────────────────────────────────────────────────────────────

function ProgressTab({ child }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchProgress(child).then(setData).catch(() => setData(null));
  }, [child]);

  if (!data) return <p className="text-gray-500 text-sm">Loading…</p>;

  const scores = data.scores || {};
  const badges = data.badges || [];
  const completed = data.completed_lessons || {};
  const streak = data.lesson_streak || 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Lesson Streak" value={`${streak} days 🔥`} color="orange" />
        <StatCard label="Badges Earned" value={badges.length} color="yellow" />
        <StatCard label="Subjects Studied" value={Object.keys(completed).length} color="blue" />
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="font-semibold mb-3">Exam Scores</h3>
        {Object.keys(scores).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(scores).map(([subject, score]) => (
              <div key={subject} className="flex items-center gap-3">
                <span className="w-32 text-sm truncate">{subject}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-3 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{score}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No exam scores yet.</p>
        )}
      </div>

      {badges.length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium dark:bg-yellow-900">🏅 {b}</span>
            ))}
          </div>
        </div>
      )}

      {Object.keys(completed).length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Lessons Completed</h3>
          <div className="space-y-1">
            {Object.entries(completed).map(([subj, lessons]) => (
              <div key={subj} className="flex items-center justify-between text-sm">
                <span>{subj}</span>
                <span className="text-gray-500">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Homework Tab ──────────────────────────────────────────────────────────────

function HomeworkTab({ child }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ subject: '', title: '', due_date: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`${API}/homework/${child}`).then((r) => r.json()).then((d) => { setItems(d.homework || []); setLoading(false); });
  }, [child]);

  useEffect(() => { load(); }, [load]);

  async function addItem(e) {
    e.preventDefault();
    await fetch(`${API}/homework/${child}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'pending' }),
    });
    setForm({ subject: '', title: '', due_date: '', notes: '' });
    load();
  }

  async function toggleStatus(item) {
    const newStatus = item.status === 'done' ? 'pending' : 'done';
    await fetch(`${API}/homework/${child}/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function deleteItem(id) {
    await fetch(`${API}/homework/${child}/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  const pending = items.filter((i) => i.status !== 'done');
  const done = items.filter((i) => i.status === 'done');

  return (
    <div className="space-y-4">
      <form onSubmit={addItem} className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Add Homework</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
        </div>
        <button type="submit" className="rounded bg-indigo-600 px-4 py-1 text-sm text-white hover:bg-indigo-700">Add</button>
      </form>

      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Pending ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map((item) => <HwItem key={item.id} item={item} onToggle={toggleStatus} onDelete={deleteItem} />)}
          </div>
        </div>
      )}
      {done.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-gray-500">Completed ({done.length})</h3>
          <div className="space-y-2 opacity-60">
            {done.map((item) => <HwItem key={item.id} item={item} onToggle={toggleStatus} onDelete={deleteItem} />)}
          </div>
        </div>
      )}
      {items.length === 0 && <p className="text-sm text-gray-500">No homework yet. Add some above.</p>}
    </div>
  );
}

function HwItem({ item, onToggle, onDelete }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <input type="checkbox" checked={item.status === 'done'} onChange={() => onToggle(item)} className="mt-1" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.status === 'done' ? 'line-through text-gray-400' : ''}`}>{item.title}</p>
        <p className="text-xs text-gray-500">{item.subject}{item.due_date ? ` · Due: ${item.due_date}` : ''}</p>
        {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
      </div>
      <button onClick={() => onDelete(item.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
    </div>
  );
}

// ── Reading Log Tab ───────────────────────────────────────────────────────────

function ReadingLogTab({ child }) {
  const [log, setLog] = useState([]);
  const [totals, setTotals] = useState({ total_pages: 0, total_minutes: 0 });
  const [form, setForm] = useState({ book: '', author: '', pages: '', duration_mins: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`${API}/reading-log/${child}`).then((r) => r.json()).then((d) => {
      setLog(d.log || []);
      setTotals({ total_pages: d.total_pages || 0, total_minutes: d.total_minutes || 0 });
      setLoading(false);
    });
  }, [child]);

  useEffect(() => { load(); }, [load]);

  async function addEntry(e) {
    e.preventDefault();
    await fetch(`${API}/reading-log/${child}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pages: Number(form.pages), duration_mins: Number(form.duration_mins) }),
    });
    setForm({ book: '', author: '', pages: '', duration_mins: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Total Pages Read" value={totals.total_pages} color="green" />
        <StatCard label="Total Reading Time" value={`${totals.total_minutes} mins`} color="blue" />
      </div>

      <form onSubmit={addEntry} className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Log Reading Session</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input required value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} placeholder="Book title" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input type="number" min="0" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="Pages read" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input type="number" min="0" value={form.duration_mins} onChange={(e) => setForm({ ...form, duration_mins: e.target.value })} placeholder="Duration (mins)" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
        </div>
        <button type="submit" className="rounded bg-green-600 px-4 py-1 text-sm text-white hover:bg-green-700">Log</button>
      </form>

      {log.length > 0 && (
        <div className="space-y-2">
          {[...log].reverse().map((entry, i) => (
            <div key={i} className="rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">📖 {entry.book}</p>
                  {entry.author && <p className="text-xs text-gray-500">{entry.author}</p>}
                </div>
                <span className="text-xs text-gray-400">{entry.date}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{entry.pages} pages · {entry.duration_mins} mins</p>
              {entry.notes && <p className="text-xs text-gray-400 mt-1">{entry.notes}</p>}
            </div>
          ))}
        </div>
      )}
      {log.length === 0 && <p className="text-sm text-gray-500">No reading sessions logged yet.</p>}
    </div>
  );
}

// ── Screen Time Tab ───────────────────────────────────────────────────────────

function ScreenTimeTab({ child }) {
  const [data, setData] = useState({ daily: {}, total_minutes: 0 });
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`${API}/screen-time/${child}`).then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, [child]);

  useEffect(() => { load(); }, [load]);

  async function addTime(e) {
    e.preventDefault();
    await fetch(`${API}/screen-time/${child}/add`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: Number(minutes), date }),
    });
    setMinutes('');
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  const entries = Object.entries(data.daily || {}).sort((a, b) => b[0].localeCompare(a[0]));
  const maxMins = Math.max(...entries.map(([, v]) => v), 1);
  const dailyLimit = 120;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Total Screen Time (14 days)" value={`${data.total_minutes} mins`} color="purple" />
        <StatCard label="Daily Limit Suggested" value="120 mins" color="gray" />
      </div>

      <form onSubmit={addTime} className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Log Screen Time</h3>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <input required type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Minutes" className="w-28 rounded border px-3 py-1 text-sm dark:bg-gray-800" />
          <button type="submit" className="rounded bg-purple-600 px-4 py-1 text-sm text-white hover:bg-purple-700">Add</button>
        </div>
      </form>

      {entries.length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-3">Last 14 Days</h3>
          <div className="space-y-2">
            {entries.map(([day, mins]) => (
              <div key={day} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-500">{day}</span>
                <div className="flex-1 h-4 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-4 rounded-full ${mins > dailyLimit ? 'bg-red-400' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min((mins / maxMins) * 100, 100)}%` }}
                  />
                </div>
                <span className={`w-16 text-right font-medium ${mins > dailyLimit ? 'text-red-500' : ''}`}>{mins} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Weekly Report Tab ─────────────────────────────────────────────────────────

function WeeklyReportTab({ child }) {
  const [report, setReport] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/weekly-report/${child}`).then((r) => r.json()),
      fetch(`${API}/attendance/${child}/summary`).then((r) => r.json()).catch(() => null),
    ]).then(([r, a]) => { setReport(r); setAttendance(a); }).catch(() => setReport(null)).finally(() => setLoading(false));
  }, [child]);

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!report) return <p className="text-sm text-red-500">Could not load report.</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
        <h3 className="font-bold text-lg">Weekly Report — {child}</h3>
        <p className="text-xs text-gray-500">Week of {report.week_of}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard label="🔥 Lesson Streak" value={`${report.lesson_streak} days`} color="orange" />
        <StatCard label="🏅 Badges" value={report.badges_earned.length} color="yellow" />
        <StatCard label="📚 Subjects Studied" value={report.subjects_studied.length} color="blue" />
        <StatCard label="📖 Reading Sessions" value={report.reading_sessions} color="green" />
        <StatCard label="📖 Pages Read" value={report.reading_pages} color="green" />
        <StatCard label="⏱ Screen Time" value={`${report.screen_time_minutes} mins`} color="purple" />
        <StatCard label="✅ Homework Done" value={report.homework_done} color="green" />
        <StatCard label="⏳ Homework Pending" value={report.homework_pending} color="red" />
        {attendance && <StatCard label="🗓 Attendance Rate" value={`${attendance.attendance_rate}%`} color="blue" />}
      </div>

      {Object.keys(report.scores).length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Exam Scores This Week</h3>
          {Object.entries(report.scores).map(([s, sc]) => (
            <div key={s} className="flex justify-between text-sm">
              <span>{s}</span><span className="font-medium">{sc}%</span>
            </div>
          ))}
        </div>
      )}

      {report.subjects_studied.length > 0 && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Subjects Studied</h3>
          <div className="flex flex-wrap gap-2">
            {report.subjects_studied.map((s) => (
              <span key={s} className="rounded-full bg-blue-100 px-3 py-1 text-xs dark:bg-blue-900">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    gray: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color] || colors.gray}`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
