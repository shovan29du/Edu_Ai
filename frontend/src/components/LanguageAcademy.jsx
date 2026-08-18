import React, { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import { speak, SpeakButton } from '../utils/tts.jsx';

export default function LanguageAcademy() {
  const [languages, setLanguages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/languages')
      .then((r) => r.json())
      .then((d) => { setLanguages(d.languages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function selectLang(code) {
    setLoading(true);
    setVocabList([]);
    setSentences([]);
    setQuizData([]);
    setTab('overview');
    try {
      const [langRes, quizRes] = await Promise.all([
        fetch(`/api/languages/${code}`).then((r) => r.json()),
        fetch(`/api/languages/${code}/quiz`).then((r) => r.json()),
      ]);
      setSelected(langRes);
      // Handle both flat array and grouped object vocab shapes
      const raw = langRes.vocabulary;
      if (Array.isArray(raw)) {
        setVocabList(raw);
      } else if (raw && typeof raw === 'object') {
        setVocabList(Object.values(raw).flat());
      }
      // Load sentences file if available
      const sentRes = await fetch(`/api/languages/${code}/sentences`).catch(() => null);
      if (sentRes?.ok) {
        const sd = await sentRes.json();
        setSentences(sd.sentences || []);
      } else {
        setSentences(langRes.common_sentences || []);
      }
      setQuizData(quizRes.quiz || []);
    } catch {}
    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
          <h2 className="text-xl font-bold">🌍 Language Academy</h2>
          <p className="text-sm opacity-90">Learn 10 world languages</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLang(lang.code)}
              className="rounded-xl border-2 border-transparent p-4 text-left shadow hover:border-green-400 hover:shadow-md transition bg-white dark:bg-gray-900"
            >
              <div className="text-3xl">{lang.flag}</div>
              <div className="mt-1 font-semibold">{lang.name}</div>
              <div className="text-sm text-gray-500">{lang.native}</div>
              <div className="mt-1 text-xs text-gray-400">{lang.speakers} speakers</div>
              <div className="mt-1 text-xs italic text-green-600">{lang.greeting}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const lang = selected;
  const tabs = ['overview', 'vocabulary', 'flashcards', 'sentences', 'grammar', 'quiz'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelected(null)} className="text-green-600 hover:underline text-sm">← All Languages</button>
        <h2 className="text-lg font-bold">{lang.flag} {lang.name}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize font-medium ${
              tab === t ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t === 'flashcards' ? '🃏 Flashcards' : t === 'quiz' ? '🧠 Quiz' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm">{lang.description}</p>
            <p className="mt-2 text-xs text-gray-500">Family: {lang.family} · Countries: {Array.isArray(lang.countries) ? lang.countries.join(', ') : lang.countries}</p>
            {lang.fun_fact && <p className="mt-2 text-xs italic">💡 {lang.fun_fact}</p>}
          </div>
          {lang.alphabet && typeof lang.alphabet === 'object' && (
            <AlphabetPanel alphabet={lang.alphabet} direction={lang.direction} langCode={lang.code} />
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-500">Vocabulary words</p>
              <p className="font-bold text-green-600">{vocabList.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-xs text-gray-500">Common sentences</p>
              <p className="font-bold text-green-600">{sentences.length}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'vocabulary' && (
        <VocabBrowser words={vocabList} direction={lang.direction} langCode={lang.code} />
      )}

      {tab === 'flashcards' && (
        <FlashcardMode words={vocabList} direction={lang.direction} langCode={lang.code} />
      )}

      {tab === 'sentences' && (
        <SentencesView sentences={sentences} direction={lang.direction} langCode={lang.code} />
      )}

      {tab === 'grammar' && lang.grammar_basics && (
        <div className="space-y-3">
          {lang.grammar_basics.map((g, i) => (
            <div key={i} className="rounded-xl border p-4">
              <h3 className="font-semibold">{g.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{g.explanation}</p>
              {g.examples && (
                <ul className="mt-2 space-y-1">
                  {g.examples.map((ex, j) => <li key={j} className="text-xs text-gray-500">• {ex}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        <VocabQuiz questions={quizData} />
      )}
    </div>
  );
}

function LetterButtons({ lettersStr, langCode, dir = 'ltr', romanizations }) {
  if (!lettersStr) return null;
  const letters = (Array.isArray(lettersStr) ? lettersStr : lettersStr.split(' ')).filter(Boolean);
  const romans = romanizations
    ? (Array.isArray(romanizations) ? romanizations : romanizations.split(' ')).filter(Boolean)
    : [];
  return (
    <div className="flex flex-wrap gap-1" dir={dir}>
      {letters.map((ltr, i) => (
        <button
          key={i}
          onClick={() => speak(ltr, langCode)}
          title={romans[i] ? `${ltr} → ${romans[i]}` : `Hear "${ltr}"`}
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1 text-lg font-bold hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 transition min-w-[2rem] text-center cursor-pointer"
        >
          {ltr}
        </button>
      ))}
    </div>
  );
}

function AlphabetPanel({ alphabet, direction, langCode = 'en' }) {
  const { name, script, letters, letters_lower, letters_latin, hiragana, katakana,
          consonants, consonants_latin, vowels, vowels_latin, tones, note, note2,
          syllable_structure, letter_forms, pronunciation_guide, accents } = alphabet;

  const dir = direction || alphabet.direction || 'ltr';

  function speakAll(str) {
    if (!str) return;
    const arr = Array.isArray(str) ? str : str.split(' ');
    speak(arr.filter(Boolean).join(' '), langCode, 0.6);
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🔤 {name || 'Script & Alphabet'}</h3>
        {letters && (
          <button
            onClick={() => speakAll(letters)}
            className="text-xs rounded-full px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition"
          >
            🔊 Hear alphabet
          </button>
        )}
      </div>
      {script && <p className="text-xs text-gray-500">Script: <span className="font-medium text-gray-700 dark:text-gray-300">{script}</span></p>}
      {note && <p className="text-sm text-gray-600 dark:text-gray-400">{note}</p>}
      {letters && (
        <div>
          <p className="text-xs text-gray-500 mb-1">{letters_lower ? 'Uppercase — tap any letter to hear it:' : 'Letters — tap any letter to hear it:'}</p>
          <LetterButtons lettersStr={letters} langCode={langCode} dir={dir} />
        </div>
      )}
      {letters_lower && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Lowercase:</p>
          <LetterButtons lettersStr={letters_lower} langCode={langCode} dir={dir} />
        </div>
      )}
      {letters_latin && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Romanization:</p>
          <p className="text-sm text-gray-600">{Array.isArray(letters_latin) ? letters_latin.join(' · ') : letters_latin}</p>
        </div>
      )}
      {accents && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Special characters — tap to hear:</p>
          <LetterButtons lettersStr={accents} langCode={langCode} dir={dir} />
        </div>
      )}
      {hiragana && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-gray-500">Hiragana — tap to hear:</p>
            <button onClick={() => speakAll(hiragana)} className="text-xs text-green-600 hover:underline">🔊 All</button>
          </div>
          <LetterButtons lettersStr={hiragana} langCode={langCode} dir={dir} />
        </div>
      )}
      {katakana && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-gray-500">Katakana — tap to hear:</p>
            <button onClick={() => speakAll(katakana)} className="text-xs text-green-600 hover:underline">🔊 All</button>
          </div>
          <LetterButtons lettersStr={katakana} langCode={langCode} dir={dir} />
        </div>
      )}
      {consonants && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-gray-500">Consonants:</p>
              <button onClick={() => speakAll(consonants)} className="text-xs text-green-600 hover:underline">🔊</button>
            </div>
            <LetterButtons lettersStr={consonants} langCode={langCode} dir={dir} romanizations={consonants_latin} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-gray-500">Vowels:</p>
              <button onClick={() => speakAll(vowels)} className="text-xs text-green-600 hover:underline">🔊</button>
            </div>
            <LetterButtons lettersStr={vowels} langCode={langCode} dir={dir} romanizations={vowels_latin} />
          </div>
        </div>
      )}
      {tones && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Tones:</p>
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(tones) ? tones : Object.entries(tones)).map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">{Array.isArray(t) ? t.join(': ') : t}</span>
            ))}
          </div>
        </div>
      )}
      {letter_forms && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Letter forms (initial · medial · final · isolated):</p>
          <p className="text-sm text-gray-600">{typeof letter_forms === 'string' ? letter_forms : JSON.stringify(letter_forms)}</p>
        </div>
      )}
      {syllable_structure && <p className="text-xs text-gray-500">Syllable structure: <span className="font-medium text-gray-700">{syllable_structure}</span></p>}
      {pronunciation_guide && <p className="text-xs text-gray-500 italic">{pronunciation_guide}</p>}
      {note2 && <p className="text-sm text-gray-600 dark:text-gray-400">{note2}</p>}
    </div>
  );
}

function VocabBrowser({ words, direction, langCode = 'en' }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = [...new Set(words.map(w => w.category).filter(Boolean))];
    return ['all', ...cats];
  }, [words]);

  const filtered = useMemo(() => {
    return words.filter(w => {
      const matchCat = category === 'all' || w.category === category;
      const q = search.toLowerCase();
      const matchSearch = !q || w.word?.toLowerCase().includes(q) || w.translation?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [words, search, category]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search word or translation…"
          className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-gray-800"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`text-xs px-2 py-0.5 rounded-full border capitalize ${category === cat ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200'}`}>
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{filtered.length} words</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((item, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-1">
              <div className={`text-lg font-bold ${direction === 'rtl' ? 'text-right flex-1' : 'flex-1'}`} dir={direction || 'ltr'}>{item.word}</div>
              <SpeakButton text={item.word} lang={langCode} />
            </div>
            {item.pronunciation && <div className="text-xs text-gray-400 italic">{item.pronunciation}</div>}
            <div className="text-sm font-medium text-green-600">{item.translation}</div>
            {item.example && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-gray-500 italic flex-1">{item.example}</span>
                <SpeakButton text={item.example} lang={langCode} />
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No words match your search.</p>}
    </div>
  );
}

function FlashcardMode({ words, direction, langCode = 'en' }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState(() => shuffle([...words]));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  if (!deck.length) return <p className="text-gray-500 text-sm">No vocabulary to show.</p>;

  const card = deck[index];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Card {index + 1} of {deck.length}</span>
        <button onClick={() => { setDeck(shuffle([...words])); setIndex(0); setFlipped(false); }}
          className="text-xs text-green-600 hover:underline">🔀 Shuffle</button>
      </div>

      <button onClick={() => setFlipped(f => !f)}
        className="w-full min-h-40 rounded-2xl border-2 border-green-300 bg-green-50 dark:bg-green-900/20 p-6 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow cursor-pointer">
        {!flipped ? (
          <>
            <div className={`text-3xl font-bold text-gray-800 dark:text-gray-100 ${direction === 'rtl' ? 'text-right w-full' : ''}`} dir={direction || 'ltr'}>
              {card.word}
            </div>
            {card.pronunciation && <div className="text-sm text-gray-500 italic">{card.pronunciation}</div>}
            <button onClick={(e) => { e.stopPropagation(); speak(card.word, langCode); }}
              className="mt-2 rounded-full px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300">
              🔊 Hear it
            </button>
            <div className="text-xs text-gray-400 mt-1">Tap card to reveal</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-green-700">{card.translation}</div>
            {card.example && <div className="text-sm text-gray-600 italic mt-1">{card.example}</div>}
            <button onClick={(e) => { e.stopPropagation(); speak(card.example || card.translation, langCode); }}
              className="mt-2 rounded-full px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300">
              🔊 Hear example
            </button>
            <div className="text-xs text-gray-400 mt-1">Tap card to flip back</div>
          </>
        )}
      </button>

      <div className="flex gap-3 justify-center">
        <button onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-40">← Prev</button>
        <button onClick={() => { setIndex(i => Math.min(deck.length - 1, i + 1)); setFlipped(false); }}
          disabled={index === deck.length - 1}
          className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm disabled:opacity-40">Next →</button>
      </div>
    </div>
  );
}

function SentencesView({ sentences, direction, langCode }) {
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => {
    const cats = [...new Set(sentences.map(s => s.category).filter(Boolean))];
    return ['all', ...cats];
  }, [sentences]);

  const filtered = category === 'all' ? sentences : sentences.filter(s => s.category === category);

  if (!sentences.length) return <p className="text-sm text-gray-500 py-4">No sentences available for this language yet.</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`text-xs px-2 py-0.5 rounded-full border capitalize ${category === cat ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200'}`}>
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((s, i) => {
          const targetText = s.target || s[langCode] || s.french || s.spanish || s.arabic || s.german || Object.values(s)[0];
          return (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <div className={`font-medium text-sm flex-1 ${direction === 'rtl' ? 'text-right' : ''}`} dir={direction || 'ltr'}>
                  {targetText}
                </div>
                <SpeakButton text={targetText} lang={langCode} />
              </div>
              {s.pronunciation && <div className="text-xs text-gray-400 italic">{s.pronunciation}</div>}
              <div className="text-sm text-green-600 mt-1">{s.english}</div>
              {s.category && <span className="text-xs text-gray-400 capitalize">{s.category.replace('_', ' ')}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VocabQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions.length) return <p className="text-gray-500">Quiz not available for this language.</p>;

  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Vocabulary Quiz — {questions.length} questions</h3>
      {questions.map((q, i) => (
        <div key={i} className="space-y-2 rounded-xl border p-4">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, j) => {
              const isSelected = answers[i] === j;
              const isCorrect = submitted && j === q.answer;
              const isWrong = submitted && isSelected && j !== q.answer;
              let cls = 'text-left px-3 py-2 rounded-lg text-sm border transition-colors ';
              if (isCorrect) cls += 'bg-green-100 border-green-400 text-green-800 font-semibold';
              else if (isWrong) cls += 'bg-red-100 border-red-400 text-red-700';
              else if (isSelected) cls += 'bg-blue-100 border-blue-400 text-blue-800';
              else cls += 'bg-gray-50 dark:bg-gray-800 border-gray-200 hover:bg-gray-100';
              return (
                <button key={j} className={cls} disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [i]: j }))}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded-lg bg-green-500 px-5 py-2 text-sm text-white disabled:opacity-50">
          Submit Quiz
        </button>
      ) : (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="font-bold text-green-700 text-lg">Score: {score} / {questions.length} 🎉</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }}
            className="mt-2 text-xs text-green-600 hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}
