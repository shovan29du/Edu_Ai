import React, { useEffect, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

const LABEL_OVERRIDES = { Shovan: 'Shovan (Dad)', Bely: 'Bely (Mom)' };

export default function ChildSelector() {
  const { child, setChild } = useChild();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUsers(d.users); })
      .catch(() => {});
  }, []);

  // Fallback while loading or if API is unreachable
  const fallback = [
    { name: 'Aliza', role: 'child' },
    { name: 'Saifan', role: 'child' },
    { name: 'Parent', role: 'parent' },
    { name: 'Shovan', role: 'parent' },
    { name: 'Bely', role: 'parent' },
  ];
  const list = users ?? fallback;

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Select profile</span>
      <select
        aria-label="Select profile"
        value={child}
        onChange={(e) => setChild(e.target.value)}
        className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500 dark:bg-gray-800 dark:text-white"
      >
        {list.map((u) => (
          <option key={u.name} value={u.name}>
            {LABEL_OVERRIDES[u.name] || u.name}
          </option>
        ))}
      </select>
    </label>
  );
}
