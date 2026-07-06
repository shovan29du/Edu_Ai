import React, { useEffect, useState } from 'react';

const PROTECTED = 'Parent';

async function apiUsers() {
  const r = await fetch('/api/users');
  if (!r.ok) throw new Error('Failed to load users');
  return r.json();
}

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add form
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState('child');
  const [addError, setAddError] = useState('');

  // Edit state: { name, newName } | null
  const [editing, setEditing] = useState(null);
  const [editError, setEditError] = useState('');

  const load = () => {
    setLoading(true);
    apiUsers()
      .then((d) => { setUsers(d.users); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    setAddError('');
    const name = addName.trim();
    if (!name) { setAddError('Name is required'); return; }
    const r = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role: addRole }),
    });
    const body = await r.json();
    if (!r.ok) { setAddError(body.detail || 'Error'); return; }
    setAddName('');
    load();
  }

  async function handleSaveEdit() {
    setEditError('');
    const newName = editing.newName.trim();
    if (!newName) { setEditError('Name is required'); return; }
    const r = await fetch(`/api/users/${encodeURIComponent(editing.name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_name: newName }),
    });
    const body = await r.json();
    if (!r.ok) { setEditError(body.detail || 'Error'); return; }
    setEditing(null);
    load();
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/users/${encodeURIComponent(name)}`, { method: 'DELETE' });
    const body = await r.json();
    if (!r.ok) { alert(body.detail || 'Error deleting user'); return; }
    load();
  }

  const children = users.filter((u) => u.role === 'child');
  const parents = users.filter((u) => u.role === 'parent');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Management</h2>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Loading…</p>}

      {/* Add user */}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Name</label>
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="e.g. Rafi"
            className="rounded border px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Role</label>
          <select value={addRole} onChange={(e) => setAddRole(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white">
            <option value="child">Child (learner)</option>
            <option value="parent">Parent (admin)</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          + Add User
        </button>
        {addError && <p className="w-full text-sm text-red-600">{addError}</p>}
      </form>

      {/* User lists */}
      {[{ label: 'Children (learners)', list: children, role: 'child' },
        { label: 'Parents / Admins', list: parents, role: 'parent' }].map(({ label, list }) => (
        <div key={label}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</h3>
          <div className="space-y-2">
            {list.map((u) => (
              <div key={u.name}
                className="flex items-center gap-3 rounded-lg border bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                <span className="flex-1 font-medium text-gray-800 dark:text-gray-100">{u.name}</span>
                {u.name === PROTECTED && (
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                    Protected
                  </span>
                )}

                {editing?.name === u.name ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editing.newName}
                      onChange={(e) => setEditing({ ...editing, newName: e.target.value })}
                      className="rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                      autoFocus
                    />
                    <button onClick={handleSaveEdit}
                      className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={() => { setEditing(null); setEditError(''); }}
                      className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">
                      Cancel
                    </button>
                    {editError && <span className="text-xs text-red-600">{editError}</span>}
                  </div>
                ) : (
                  <>
                    {u.name !== PROTECTED && (
                      <button onClick={() => { setEditing({ name: u.name, newName: u.name }); setEditError(''); }}
                        className="rounded border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.name)}
                      disabled={u.name === PROTECTED}
                      className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950">
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
            {list.length === 0 && <p className="text-sm text-gray-400">None</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
