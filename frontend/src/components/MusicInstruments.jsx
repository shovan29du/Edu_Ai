import { useState, useEffect, useRef } from 'react';
import { fetchSafeMusic } from '../api/safety.js';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress, postProgress } from '../api/progress.js';

const API = '/api/music-instruments';

// ── Virtual instrument simulator (pure Web Audio API synthesis, no samples) ──

// One octave (C4 → C5) mapped to a QWERTY row so the simulator is playable
// from a keyboard as well as by clicking/tapping. White keys follow the
// classic "home row" virtual-piano layout (A S D F G H J K); black keys sit
// on the row above (W E _ T Y U), matching where they'd fall on a real piano.
const NOTE_DEFS = [
  { note: 'C4', midi: 60, key: 'a', type: 'white' },
  { note: 'C#4', midi: 61, key: 'w', type: 'black' },
  { note: 'D4', midi: 62, key: 's', type: 'white' },
  { note: 'D#4', midi: 63, key: 'e', type: 'black' },
  { note: 'E4', midi: 64, key: 'd', type: 'white' },
  { note: 'F4', midi: 65, key: 'f', type: 'white' },
  { note: 'F#4', midi: 66, key: 't', type: 'black' },
  { note: 'G4', midi: 67, key: 'g', type: 'white' },
  { note: 'G#4', midi: 68, key: 'y', type: 'black' },
  { note: 'A4', midi: 69, key: 'h', type: 'white' },
  { note: 'A#4', midi: 70, key: 'u', type: 'black' },
  { note: 'B4', midi: 71, key: 'j', type: 'white' },
  { note: 'C5', midi: 72, key: 'k', type: 'white' },
];

// Six "strings" tuned like a real guitar (E2 A2 D3 G3 B3 E4), mapped to the
// same left-hand home row so the same keyboard habit carries over.
const GUITAR_STRING_DEFS = [
  { note: 'E2', midi: 40, key: 'a', label: 'Low E' },
  { note: 'A2', midi: 45, key: 's', label: 'A' },
  { note: 'D3', midi: 50, key: 'd', label: 'D' },
  { note: 'G3', midi: 55, key: 'f', label: 'G' },
  { note: 'B3', midi: 59, key: 'g', label: 'B' },
  { note: 'E4', midi: 64, key: 'h', label: 'High E' },
];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getAudioContextClass() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

// Synthesizes and plays a single note with an envelope shaped for the given
// timbre. 'piano' uses a soft triangle wave with a quick attack and a
// natural decay; 'guitar' uses a brighter sawtooth wave with a very fast
// "pluck" attack and a longer, string-like decay.
function playSynthNote(ctx, midi, timbre = 'piano') {
  const freq = midiToFreq(midi);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  if (timbre === 'guitar') {
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  } else {
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.95);
  }
}

// Playable virtual piano: click/tap a key or press its mapped keyboard key.
function PianoSimulator() {
  const AudioCtxClass = getAudioContextClass();
  const audioCtxRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(() => new Set());

  function getContext() {
    if (!AudioCtxClass) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function triggerNote(midi) {
    const ctx = getContext();
    if (!ctx) return;
    playSynthNote(ctx, midi, 'piano');
    setActiveNotes((prev) => new Set(prev).add(midi));
    window.setTimeout(() => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    }, 200);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const def = NOTE_DEFS.find((n) => n.key === e.key.toLowerCase());
      if (def) triggerNote(def.midi);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => audioCtxRef.current?.close?.(), []);

  if (!AudioCtxClass) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        🔇 Your browser doesn't support the Web Audio API, so the virtual piano can't play sound here.
      </p>
    );
  }

  const whiteKeys = NOTE_DEFS.filter((n) => n.type === 'white');
  const blackKeys = NOTE_DEFS.filter((n) => n.type === 'black');

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Click/tap the keys, or play them with your keyboard: {NOTE_DEFS.map((n) => n.key.toUpperCase()).join(' ')}
      </p>
      <div
        role="group"
        aria-label="Virtual piano keyboard"
        className="relative flex select-none"
        style={{ height: 140 }}
      >
        {whiteKeys.map((n) => (
          <button
            key={n.note}
            type="button"
            aria-label={`Play ${n.note}`}
            onMouseDown={() => triggerNote(n.midi)}
            onTouchStart={(e) => {
              e.preventDefault();
              triggerNote(n.midi);
            }}
            className={`relative flex-1 border border-gray-400 rounded-b-md flex items-end justify-center pb-1 text-[10px] font-semibold text-gray-400 ${
              activeNotes.has(n.midi) ? 'bg-blue-200 dark:bg-blue-300' : 'bg-white dark:bg-gray-100'
            }`}
          >
            {n.key.toUpperCase()}
          </button>
        ))}
        {blackKeys.map((n) => {
          const idx = whiteKeys.findIndex((w) => w.midi === n.midi - 1);
          const leftPercent = ((idx + 1) / whiteKeys.length) * 100;
          return (
            <button
              key={n.note}
              type="button"
              aria-label={`Play ${n.note}`}
              onMouseDown={() => triggerNote(n.midi)}
              onTouchStart={(e) => {
                e.preventDefault();
                triggerNote(n.midi);
              }}
              style={{ left: `calc(${leftPercent}% - 14px)`, width: 28, height: '60%' }}
              className={`absolute top-0 z-10 rounded-b-md flex items-end justify-center pb-1 text-[9px] font-semibold text-gray-300 ${
                activeNotes.has(n.midi) ? 'bg-blue-500' : 'bg-gray-900 dark:bg-black'
              }`}
            >
              {n.key.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Playable virtual guitar: six synthesized "strings" with a plucked-string
// envelope, reusing the same synth engine and keyboard-mapping approach.
function GuitarSimulator() {
  const AudioCtxClass = getAudioContextClass();
  const audioCtxRef = useRef(null);
  const [activeStrings, setActiveStrings] = useState(() => new Set());

  function getContext() {
    if (!AudioCtxClass) return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function pluckString(midi) {
    const ctx = getContext();
    if (!ctx) return;
    playSynthNote(ctx, midi, 'guitar');
    setActiveStrings((prev) => new Set(prev).add(midi));
    window.setTimeout(() => {
      setActiveStrings((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    }, 300);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const def = GUITAR_STRING_DEFS.find((n) => n.key === e.key.toLowerCase());
      if (def) pluckString(def.midi);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => audioCtxRef.current?.close?.(), []);

  if (!AudioCtxClass) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        🔇 Your browser doesn't support the Web Audio API, so the virtual guitar can't play sound here.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Click/tap a string to pluck it, or play with your keyboard: {GUITAR_STRING_DEFS.map((n) => n.key.toUpperCase()).join(' ')}
      </p>
      <div role="group" aria-label="Virtual guitar strings" className="space-y-2 select-none">
        {GUITAR_STRING_DEFS.map((n) => (
          <button
            key={n.note}
            type="button"
            aria-label={`Pluck ${n.label} string (${n.note})`}
            onMouseDown={() => pluckString(n.midi)}
            onTouchStart={(e) => {
              e.preventDefault();
              pluckString(n.midi);
            }}
            className="w-full flex items-center gap-3 rounded border px-3 py-1.5 dark:border-gray-700"
          >
            <span className="text-xs font-semibold w-16 text-left text-gray-500 dark:text-gray-400">
              {n.label} ({n.key.toUpperCase()})
            </span>
            <span
              className={`h-1 flex-1 rounded-full transition-colors ${
                activeStrings.has(n.midi) ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function InstrumentSimulator({ instrumentId }) {
  if (instrumentId === 'piano' || instrumentId === 'keyboard') {
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🎹 Try it — Virtual Piano</h4>
        <PianoSimulator />
      </div>
    );
  }
  if (instrumentId === 'guitar') {
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🎸 Try it — Virtual Guitar</h4>
        <GuitarSimulator />
      </div>
    );
  }
  return null;
}

// ── Practice-routine tracking ─────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function PracticeRoutines({ instrumentId, routines }) {
  const { child } = useChild();
  const [completed, setCompleted] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);

  const subjectKey = `music_${instrumentId}`;
  const today = todayISO();

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    fetchProgress(child)
      .then((p) => {
        if (!cancelled) setCompleted(p.completed_lessons?.[subjectKey] || []);
      })
      .catch(() => {
        if (!cancelled) setCompleted([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [child, subjectKey]);

  async function markPracticed(index) {
    const lessonId = `practice-${index}-${today}`;
    if (completed.includes(lessonId)) return;
    setSavingIndex(index);
    try {
      await postProgress(child, { completed_lessons: { [subjectKey]: [lessonId] } });
      setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    } finally {
      setSavingIndex(null);
    }
  }

  if (!routines?.length) return null;

  const totalPracticed = completed.filter((id) => id.startsWith('practice-')).length;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200">🗓️ Practice Routines</h4>
        {loaded && (
          <span className="rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 px-2 py-0.5 text-xs font-semibold">
            🔥 Practiced {totalPracticed} time{totalPracticed === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
        {routines.map((r, i) => {
          const lessonId = `practice-${i}-${today}`;
          const doneToday = completed.includes(lessonId);
          const checkboxId = `practice-${instrumentId}-${i}`;
          return (
            <li key={i} className="flex items-start gap-2">
              <input
                type="checkbox"
                id={checkboxId}
                checked={doneToday}
                disabled={doneToday || savingIndex === i}
                onChange={() => markPracticed(i)}
                className="mt-1"
                aria-label={`Mark practiced today: ${r}`}
              />
              <label htmlFor={checkboxId} className={doneToday ? 'text-gray-400 line-through' : ''}>
                {r}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SafeMusicPlayer() {
  const { isRestricted } = useChild();
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSafeMusic()
      .then(setSongs)
      .catch((err) => setError(err.message));
  }, []);

  const visible = songs.filter((s) => !isRestricted || isResourceSafe(s));

  return (
    <section aria-label="Safe music library" className="mb-8 rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-semibold">🎧 Safe Music Library</h2>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!error && visible.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">No songs available.</p>
      )}
      <ul className="space-y-3">
        {visible.map((song, i) => (
          <li key={i} className="rounded border p-3 dark:border-gray-700">
            <a
              href={song.videoUrl || song.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {song.title}
            </a>
            {song.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300">{song.description}</p>
            )}
            {song.source && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{song.source}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// Converts an archive.org/details/ID URL to an embeddable archive.org/embed/ID
// player URL — same pattern MoviesLibrary.jsx uses for public-domain films.
// Music-instruments lesson data doesn't currently include any archive.org
// links, but any lesson/resource that does gets an in-app player instead of
// only an outbound link, the moment curated data adds one.
function archiveEmbedUrl(url) {
  const m = url?.match(/archive\.org\/details\/([^?#]+)/);
  return m ? `https://archive.org/embed/${m[1]}` : null;
}

function LessonList({ title, lessons }) {
  if (!lessons?.length) return null;
  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h4>
      <ul className="space-y-2">
        {lessons.map((lesson, i) => {
          const embed = archiveEmbedUrl(lesson.youtube_search_url) || archiveEmbedUrl(lesson.audio_url);
          return (
            <li key={i} className="rounded-lg border p-3 dark:border-gray-700">
              <p className="font-medium text-sm">{lesson.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lesson.description}</p>
              {embed ? (
                <div className="mt-2 rounded overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src={embed}
                    title={lesson.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={lesson.youtube_search_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  ▶ Find lessons on YouTube
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InstrumentDetail({ instrumentId, onBack }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/instrument/${instrumentId}`)
      .then((r) => r.json())
      .then(setData);
  }, [instrumentId]);

  if (!data) return <div className="p-4 text-gray-500">Loading…</div>;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back to instruments
      </button>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{data.emoji}</span>
        <h2 className="text-2xl font-bold">{data.label}</h2>
      </div>

      <InstrumentSimulator instrumentId={instrumentId} />

      <LessonList title="🌱 Beginner Lessons" lessons={data.beginner} />
      <LessonList title="🌿 Intermediate Lessons" lessons={data.intermediate} />
      <LessonList title="🌳 Advanced Lessons" lessons={data.advanced} />

      <PracticeRoutines instrumentId={instrumentId} routines={data.practice_routines} />

      {data.youtube_searches?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🔗 Curated Video Searches</h4>
          <div className="flex flex-wrap gap-2">
            {data.youtube_searches.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {data.audio_resources?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🎧 Audio & Sheet Music Resources</h4>
          <div className="flex flex-wrap gap-2">
            {data.audio_resources.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {data.pinterest_search && (
        <a
          href={data.pinterest_search}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-full border px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          📌 Pinterest — {data.label} charts & diagrams
        </a>
      )}
    </div>
  );
}

function CategoryDetail({ categoryId, onBack }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/category/${categoryId}`)
      .then((r) => r.json())
      .then(setData);
  }, [categoryId]);

  if (!data) return <div className="p-4 text-gray-500">Loading…</div>;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Back
      </button>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{data.emoji}</span>
        <h2 className="text-2xl font-bold">{data.label}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{data.description}</p>

      {data.topics?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Topics covered</h4>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((t, i) => (
              <span key={i} className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.resources?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Recommended resources</h4>
          <ul className="space-y-1">
            {data.resources.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function MusicInstruments() {
  const [overview, setOverview] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load Music & Instruments'))))
      .then(setOverview)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="p-8 text-center text-red-600" role="alert">{error}</div>;
  }

  if (!overview) return <div className="p-8 text-center text-gray-500">Loading Music &amp; Instruments…</div>;

  if (selectedInstrument) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <InstrumentDetail instrumentId={selectedInstrument} onBack={() => setSelectedInstrument(null)} />
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <CategoryDetail categoryId={selectedCategory} onBack={() => setSelectedCategory(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-1">🎵 Music &amp; Instruments</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{overview.description}</p>

      <SafeMusicPlayer />

      <h2 className="text-lg font-semibold mb-2">Learning tracks</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {overview.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className="text-left rounded-xl border-2 p-4 hover:shadow-md transition-shadow dark:border-gray-700"
          >
            <p className="text-2xl mb-1">{cat.emoji}</p>
            <p className="font-bold">{cat.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.description}</p>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Instruments</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {overview.instruments.map((inst) => (
          <button
            key={inst.id}
            onClick={() => setSelectedInstrument(inst.id)}
            className="text-left rounded-xl border-2 p-4 hover:shadow-md transition-shadow dark:border-gray-700"
          >
            <p className="text-3xl mb-1">{inst.emoji}</p>
            <p className="font-bold text-sm">{inst.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
