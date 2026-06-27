export async function fetchSafeChannels() {
  const res = await fetch('/api/safe-channels');
  if (!res.ok) throw new Error('Could not load safe channels');
  return res.json();
}

export async function fetchSafeMusic() {
  const res = await fetch('/api/safe-music');
  if (!res.ok) throw new Error('Could not load safe music');
  return res.json();
}

export async function fetchSingAlongSongs() {
  const res = await fetch('/api/sing-along-songs');
  if (!res.ok) throw new Error('Could not load sing-along songs');
  return res.json();
}
