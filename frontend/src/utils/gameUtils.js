// Small shared helpers used across the Games Centre engines and game data.

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sample(array) {
  return array[randInt(0, array.length - 1)];
}

// Builds a shuffled list of unique numeric answer options that always
// includes `answer`, padded out with nearby distractor values.
export function numericOptions(answer, count = 4, spread = 10) {
  const opts = new Set([answer]);
  let guard = 0;
  while (opts.size < count && guard < 200) {
    guard += 1;
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 0 && !opts.has(candidate)) {
      opts.add(candidate);
    }
  }
  return shuffle([...opts]).map(String);
}

export function scrambleWord(word) {
  const letters = word.split('');
  let attempt = word;
  let guard = 0;
  while ((attempt === word || attempt.length < 3) && guard < 20) {
    attempt = shuffle(letters).join('');
    guard += 1;
  }
  return attempt;
}
