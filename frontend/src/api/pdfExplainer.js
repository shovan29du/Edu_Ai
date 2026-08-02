async function responseError(res, fallback) {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;
  return `${fallback} (HTTP ${res.status || 'error'})`;
}

export async function listPdfDocuments(child = '') {
  const params = new URLSearchParams();
  if (child) params.set('child', child);
  const res = await fetch(`/api/pdf-explainer?${params}`);
  if (!res.ok) throw new Error(await responseError(res, 'Could not load documents'));
  return res.json();
}

export async function uploadPdfDocument(file, child = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (child) formData.append('child', child);
  const res = await fetch('/api/pdf-explainer/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await responseError(res, 'Upload failed'));
  return res.json();
}

export async function deletePdfDocument(id) {
  const res = await fetch(`/api/pdf-explainer/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await responseError(res, 'Could not delete document'));
  return res.json();
}

export async function explainPdfDocument(id, levelArgs) {
  const res = await fetch(`/api/pdf-explainer/${id}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(levelArgs),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not explain this document'));
  return res.json();
}

export async function askPdfDocument(id, question, levelArgs) {
  const res = await fetch(`/api/pdf-explainer/${id}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...levelArgs, question }),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not answer the question'));
  return res.json();
}

export async function quizPdfDocument(id, count, levelArgs) {
  const res = await fetch(`/api/pdf-explainer/${id}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...levelArgs, count }),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not generate a quiz'));
  return res.json();
}

export async function listPdfNotes(id, child = '') {
  const params = new URLSearchParams();
  if (child) params.set('child', child);
  const res = await fetch(`/api/pdf-explainer/${id}/notes?${params}`);
  if (!res.ok) throw new Error(await responseError(res, 'Could not load notes'));
  return res.json();
}

export async function addPdfNote(id, text, child = '') {
  const res = await fetch(`/api/pdf-explainer/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, child }),
  });
  if (!res.ok) throw new Error(await responseError(res, 'Could not save note'));
  return res.json();
}

export async function deletePdfNote(noteId) {
  const res = await fetch(`/api/pdf-explainer/notes/${noteId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await responseError(res, 'Could not delete note'));
  return res.json();
}
