export async function fetchGrade(standard) {
  const res = await fetch(`/api/grade/${standard}`);
  if (!res.ok) throw new Error(`Grade ${standard} not available`);
  return res.json();
}

export async function searchGrade(standard, query) {
  const res = await fetch(`/api/search/${standard}?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Search failed for grade ${standard}`);
  return res.json();
}
