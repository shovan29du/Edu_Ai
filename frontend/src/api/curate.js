export async function webSearch(query) {
  const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Web search failed');
  }
  return res.json();
}

export async function curateResource({ standard, subject, resourceType, resource }) {
  const res = await fetch('/api/curate-resource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ standard, subject, resource_type: resourceType, resource }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Could not add resource to syllabus');
  }
  return res.json();
}
