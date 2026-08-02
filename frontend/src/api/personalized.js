function encode(value) {
  return encodeURIComponent(String(value));
}

export async function fetchPersonalizedProfile(profile, levelId, subject) {
  const response = await fetch(
    `/api/personalized/${encode(profile)}/${encode(levelId)}/${encode(subject)}`
  );
  if (!response.ok) throw new Error('Could not load personalized learning profile');
  return response.json();
}

export async function recordLearningEvidence(profile, evidence) {
  const response = await fetch(`/api/personalized/${encode(profile)}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evidence),
  });
  if (!response.ok) throw new Error('Could not save learning evidence');
  const result = await response.json();
  window.dispatchEvent(new CustomEvent('personalized-learning-updated', {
    detail: { profile, levelId: evidence.level_id, subject: evidence.subject },
  }));
  return result;
}
