import { useState, useEffect } from 'react';

const API = '/api';
const CHILDREN = ['Aliza', 'Saifan'];
const STATUS_OPTS = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'late', label: 'Late', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'excused', label: 'Excused', color: 'bg-blue-100 text-blue-700 border-blue-300' },
];
const statusStyle = (s) => STATUS_OPTS.find(o => o.value === s)?.color || 'bg-gray-100 text-gray-600';

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function AttendanceTracker() {
  const [child, setChild] = useState(CHILDREN[0]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [newDate, setNewDate] = useState(today());
  const [newStatus, setNewStatus] = useState('present');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`${API}/parent/attendance/${child}`).then(r => r.json()).then(d => setRecords(d.records || []));
    fetch(`${API}/parent/attendance/${child}/summary`).then(r => r.json()).then(setSummary);
  };

  useEffect(() => { load(); }, [child]);

  const handleAdd = async () => {
    setSaving(true);
    await fetch(`${API}/parent/attendance/${child}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, status: newStatus, note: newNote }),
    });
    setNewNote('');
    setSaving(false);
    load();
  };

  const handleDelete = async (date) => {
    await fetch(`${API}/parent/attendance/${child}/${date}`, { method: 'DELETE' });
    load();
  };

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">📅 Attendance Tracker</h2>
      <p className="text-gray-500 text-sm mb-4">Track daily attendance for each child.</p>

      {/* Child selector */}
      <div className="flex gap-2 mb-5">
        {CHILDREN.map(c => (
          <button key={c} onClick={() => setChild(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${child === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl bg-white border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{summary.attendance_rate}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Attendance Rate</p>
          </div>
          {Object.entries(summary.counts).map(([k, v]) => (
            <div key={k} className={`rounded-xl border p-3 text-center ${statusStyle(k)}`}>
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-xs mt-0.5 capitalize">{k}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add record */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">Add Record</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          {STATUS_OPTS.map(opt => (
            <button key={opt.value} onClick={() => setNewStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${newStatus === opt.value ? opt.color : 'bg-white border-gray-200 text-gray-500'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Note (optional)" value={newNote} onChange={e => setNewNote(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={handleAdd} disabled={saving}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Records list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No records yet. Add the first attendance entry above.</p>
        ) : sorted.map(rec => (
          <div key={rec.date} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm font-mono text-gray-500 w-28 flex-shrink-0">{rec.date}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize flex-shrink-0 ${statusStyle(rec.status)}`}>{rec.status}</span>
            <span className="text-xs text-gray-500 flex-1 truncate">{rec.note}</span>
            <button onClick={() => handleDelete(rec.date)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
