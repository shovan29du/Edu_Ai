// Real streaming and online-learning platforms a learner/parent might already
// have an account with. EduAi_Pro never collects a password for these services
// — "connecting" a platform here is just a local preference (which platforms
// you have) so the app can point you at the right place. Clicking a platform
// always opens that provider's own real site, where you sign in directly with
// them, never through us.
export const STREAMING_PLATFORMS = [
  { id: 'netflix', label: 'Netflix', emoji: '🎬', url: 'https://www.netflix.com/login' },
  { id: 'prime_video', label: 'Amazon Prime Video', emoji: '📺', url: 'https://www.primevideo.com' },
  { id: 'max', label: 'Max (HBO)', emoji: '🟣', url: 'https://www.max.com' },
  { id: 'disney_plus', label: 'Disney+', emoji: '🏰', url: 'https://www.disneyplus.com' },
  { id: 'hulu', label: 'Hulu', emoji: '🟢', url: 'https://www.hulu.com' },
  { id: 'youtube_premium', label: 'YouTube Premium', emoji: '▶️', url: 'https://www.youtube.com/premium' },
];

export const LEARNING_PLATFORMS = [
  { id: 'coursera', label: 'Coursera', emoji: '🎓', url: 'https://www.coursera.org/account/signin' },
  { id: 'edx', label: 'edX', emoji: '📘', url: 'https://home.edx.org/login' },
  { id: 'udemy', label: 'Udemy', emoji: '💻', url: 'https://www.udemy.com/join/login-popup/' },
];

export const ALL_PLATFORMS = [...STREAMING_PLATFORMS, ...LEARNING_PLATFORMS];
