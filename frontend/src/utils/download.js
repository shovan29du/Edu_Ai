function filenameFromResponse(res, fallback) {
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

export async function downloadFile(url, fallbackFilename, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const filename = filenameFromResponse(res, fallbackFilename);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
