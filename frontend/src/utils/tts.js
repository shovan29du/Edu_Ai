// BCP-47 lang codes for Web Speech API
const LANG_CODES = {
  fr: 'fr-FR', de: 'de-DE', es: 'es-ES', ar: 'ar-SA',
  zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', ru: 'ru-RU',
  it: 'it-IT', en: 'en-US', pt: 'pt-BR', hi: 'hi-IN',
};

export function getLangCode(code) {
  return LANG_CODES[code] || code || 'en-US';
}

export function speak(text, langCode = 'en', rate = 0.85) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = getLangCode(langCode);
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}

export function SpeakButton({ text, lang = 'en', className = '' }) {
  if (!window.speechSynthesis) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text, lang); }}
      title={`Hear pronunciation (${lang.toUpperCase()})`}
      className={`rounded-full p-1 text-xs hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition ${className}`}
    >
      🔊
    </button>
  );
}
