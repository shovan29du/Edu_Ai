export async function fetchProgress(child) {
  const res = await fetch(`/api/progress/${child}`);
  if (!res.ok) throw new Error(`Could not load progress for ${child}`);
  return res.json();
}

export async function postProgress(child, update) {
  const res = await fetch(`/api/progress/${child}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`Could not save progress for ${child}`);
  return res.json();
}
