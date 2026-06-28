export async function listResourceTabDocuments() {
  const res = await fetch('/api/resource-tab');
  if (!res.ok) throw new Error('Could not load uploaded documents');
  return res.json();
}

export async function uploadResourceTabDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/resource-tab/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Upload failed');
  }
  return res.json();
}

export async function deleteResourceTabDocument(id) {
  const res = await fetch(`/api/resource-tab/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Could not delete document');
  return res.json();
}

export function resourceTabDownloadUrl(id) {
  return `/api/resource-tab/${id}/download`;
}
