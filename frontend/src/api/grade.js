export async function fetchGrade(standard) {
  const res = await fetch(`/api/grade/${standard}`);
  if (!res.ok) throw new Error(`Grade ${standard} not available`);
  return res.json();
}
