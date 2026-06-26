const BLOCKED_WORDS = [
  'damn',
  'hell',
  'stupid',
  'idiot',
  'kill',
  'violence',
  'drug',
  'alcohol',
  'hate',
  'racist',
];

const PATTERN = new RegExp(`\\b(${BLOCKED_WORDS.join('|')})\\b`, 'i');

export function isTextSafe(text) {
  if (!text) return true;
  return !PATTERN.test(text);
}

export function isResourceSafe(resource) {
  if (resource?.safe === false) return false;
  return Object.values(resource || {}).every(
    (value) => typeof value !== 'string' || isTextSafe(value)
  );
}
