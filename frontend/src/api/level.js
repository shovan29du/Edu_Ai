export async function fetchLevels() {
  const res = await fetch('/api/levels');
  if (!res.ok) throw new Error('Could not load levels');
  return res.json();
}

export async function fetchLevel(levelId) {
  const res = await fetch(`/api/level/${levelId}`);
  if (!res.ok) throw new Error(`Level ${levelId} not available`);
  return res.json();
}

export async function fetchLevelOverview(levelId) {
  const res = await fetch(`/api/level/${encodeURIComponent(levelId)}/overview`);
  if (!res.ok) throw new Error(`Level ${levelId} not available`);
  return res.json();
}

export async function fetchLevelSubject(levelId, subjectName) {
  const res = await fetch(
    `/api/level/${encodeURIComponent(levelId)}/subjects/${encodeURIComponent(subjectName)}`
  );
  if (!res.ok) throw new Error(`${subjectName} is not available at level ${levelId}`);
  return res.json();
}

export async function searchLevel(levelId, query) {
  const res = await fetch(`/api/level/${levelId}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search failed for level ${levelId}`);
  return res.json();
}
