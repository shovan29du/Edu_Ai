async function responseError(res, fallback) {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;
  return `${fallback} (HTTP ${res.status || 'error'})`;
}

export async function generateLessonPlan(body) {
  const res = await fetch('/api/lesson-planner/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not generate a lesson plan'));
  return res.json();
}

export async function listLessonPlans(ownerId) {
  const res = await fetch(`/api/lesson-planner?owner_id=${encodeURIComponent(ownerId)}`);
  if (!res.ok) throw new Error(await responseError(res, 'Could not load lesson plans'));
  return res.json();
}

export async function deleteLessonPlan(planId) {
  const res = await fetch(`/api/lesson-planner/${planId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await responseError(res, 'Could not delete this plan'));
  return res.json();
}

export async function rescheduleLesson(planId, lessonId, newDate) {
  const res = await fetch(`/api/lesson-planner/${planId}/lessons/${lessonId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: newDate }),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not reschedule this lesson'));
  return res.json();
}
