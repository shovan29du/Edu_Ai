export async function fetchPaintings(child) {
  const res = await fetch(`/api/paintings/${child}`);
  if (!res.ok) throw new Error(`Could not load paintings for ${child}`);
  return res.json();
}

export async function savePainting(child, { id, title, image }) {
  const res = await fetch(`/api/paintings/${child}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, image }),
  });
  if (!res.ok) throw new Error(`Could not save painting for ${child}`);
  return res.json();
}

export async function deletePainting(child, paintingId) {
  const res = await fetch(`/api/paintings/${child}/${paintingId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Could not delete painting for ${child}`);
  return res.json();
}

export function paintingImageUrl(child, paintingId) {
  return `/api/paintings/${child}/${paintingId}/image`;
}
