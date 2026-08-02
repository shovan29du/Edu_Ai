async function responseError(res, fallback) {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;
  return `${fallback} (HTTP ${res.status || 'error'})`;
}

export async function generateStudyQuestions(body) {
  const res = await fetch('/api/study-coach/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not generate study questions'));
  return res.json();
}

export async function listDueQuestions(child, limit = 20) {
  const params = new URLSearchParams({ child, limit: String(limit) });
  const res = await fetch(`/api/study-coach/due?${params}`);
  if (!res.ok) throw new Error(await responseError(res, 'Could not load due questions'));
  return res.json();
}

export async function submitStudyAnswer(questionId, child, answer, confidence) {
  const res = await fetch(`/api/study-coach/${questionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ child, answer, confidence }),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not submit your answer'));
  return res.json();
}

export async function getStudyStats(child) {
  const params = new URLSearchParams({ child });
  const res = await fetch(`/api/study-coach/stats?${params}`);
  if (!res.ok) throw new Error(await responseError(res, 'Could not load study stats'));
  return res.json();
}

export async function deleteStudyTopic(topic, child) {
  const params = new URLSearchParams({ child });
  const res = await fetch(`/api/study-coach/topics/${encodeURIComponent(topic)}?${params}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await responseError(res, 'Could not delete this topic'));
  return res.json();
}
