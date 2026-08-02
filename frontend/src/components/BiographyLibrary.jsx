import { useState, useEffect, useRef } from 'react';

const API = '/api';

// ── Lazy Wikipedia portrait ────────────────────────────────────────────────
// Reuses the same server-side thumbnail proxy/cache the Virtual Museum uses
// (GET /api/museum/thumbnail in backend/app/main.py is a generic Wikipedia
// REST-summary thumbnail cache keyed by wiki_title, not museum-specific),
// so every real biography subject gets a live photo from their own
// Wikipedia page rather than a guessed or fabricated image URL.
const portraitCache = {};

function Portrait({ wikiTitle, name, size = 'list' }) {
  const [src, setSrc] = useState(portraitCache[wikiTitle] || null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (!wikiTitle) return;
    if (portraitCache[wikiTitle] && portraitCache[wikiTitle] !== 'loading') {
      if (portraitCache[wikiTitle]) setSrc(portraitCache[wikiTitle]);
      return;
    }
    portraitCache[wikiTitle] = 'loading';
    fetch(`${API}/museum/thumbnail?wiki_title=${encodeURIComponent(wikiTitle)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const url = d?.thumbnail_url ?? null;
        portraitCache[wikiTitle] = url || '';
        if (mounted.current && url) setSrc(url);
      })
      .catch(() => { portraitCache[wikiTitle] = ''; });
  }, [wikiTitle]);

  const dims = size === 'hero' ? 'w-28 h-28' : 'w-14 h-14';
  const hash = [...(name || '')].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 0);
  const palettes = [
    ['#312e81', '#7c3aed'], ['#7f1d1d', '#e11d48'], ['#064e3b', '#0d9488'],
    ['#78350f', '#d97706'], ['#1e3a8a', '#0284c7'], ['#4a044e', '#c026d3'],
  ];
  const [from, to] = palettes[hash % palettes.length];
  const initials = (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className={`${dims} flex-shrink-0 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center`}>
      {src
        ? <img src={src} alt={`Portrait of ${name}`} className="w-full h-full object-cover" onError={() => setSrc(null)} />
        : (
          <div
            role="img"
            aria-label={`Placeholder portrait for ${name}`}
            className="flex h-full w-full items-center justify-center text-white font-bold"
            style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
          >
            <span className={size === 'hero' ? 'text-2xl' : 'text-sm'}>{initials}</span>
          </div>
        )}
    </div>
  );
}

function LinkBar({ links }) {
  if (!links) return null;
  const items = [
    links.wikipedia && { href: links.wikipedia, label: 'ℹ Wikipedia', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    links.video && { href: links.video, label: '▶ Video', color: 'bg-red-100 text-red-700 border-red-200' },
    links.image_search && { href: links.image_search, label: '🖼 More Images', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    links.learn_more && { href: links.learn_more, label: '🔍 Learn More', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-5 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">🔗 Links & Media</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(({ href, label, color }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium hover:opacity-80 transition-opacity ${color}`}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

function PersonDetail({ section, personId, onBack }) {
  const [person, setPerson] = useState(null);
  useEffect(() => {
    setPerson(null);
    fetch(`${API}/biographies/${section}/${personId}`).then((r) => r.json()).then(setPerson);
  }, [section, personId]);
  if (!person) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-indigo-600 hover:underline">← Back to people</button>
      <div className="flex gap-4 mb-1 items-start">
        <Portrait wikiTitle={person.wiki_title} name={person.name} size="hero" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{person.name}</h2>
          <p className="text-sm text-gray-500">{person.field}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 mt-2">
        {person.years && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📅 {person.years}</span>}
        {person.nationality && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">🌍 {person.nationality}</span>}
      </div>
      <div className="text-gray-700 leading-relaxed mb-5 whitespace-pre-line">{person.summary}</div>
      {person.key_facts?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">🔑 Key Facts</h3>
          <ul className="space-y-1">
            {person.key_facts.map((f, i) => (
              <li key={i} className="text-sm text-gray-700">• {f}</li>
            ))}
          </ul>
        </div>
      )}
      {person.discussion?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">💬 Discussion Questions</h3>
          <ol className="space-y-1">
            {person.discussion.map((q, i) => (
              <li key={i} className="text-sm text-blue-900">{i + 1}. {q}</li>
            ))}
          </ol>
        </div>
      )}
      <LinkBar links={person.links} />
    </div>
  );
}

function PersonCard({ person, onClick }) {
  return (
    <button onClick={onClick}
      className="text-left rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 hover:shadow-md transition-shadow flex gap-3">
      <Portrait wikiTitle={person.wiki_title} name={person.name} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-800">{person.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{person.field}{person.years ? ` · ${person.years}` : ''}</p>
        {person.nationality && <p className="text-xs text-gray-400">{person.nationality}</p>}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{person.summary?.slice(0, 110)}…</p>
      </div>
    </button>
  );
}

function SectionView({ section, onBack }) {
  const [data, setData] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  useEffect(() => {
    fetch(`${API}/biographies/${section.id}`).then((r) => r.json()).then(setData);
  }, [section.id]);
  if (selectedPerson) return <PersonDetail section={section.id} personId={selectedPerson} onBack={() => setSelectedPerson(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-indigo-600 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-1">{section.emoji} {section.label}</h2>
      <p className="text-sm text-gray-500 mb-4">{section.description}</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.people?.map((person) => (
            <PersonCard key={person.id} person={person} onClick={() => setSelectedPerson(person.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResults({ query, onOpenPerson }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    const q = query.trim();
    if (q.length < 2) { setData(null); return; }
    const t = setTimeout(() => {
      fetch(`${API}/biographies/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => { if (active) setData(d); });
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [query]);

  if (query.trim().length < 2) return <p className="text-sm text-gray-400">Type at least 2 characters to search every category.</p>;
  if (!data) return <p className="text-gray-400">Searching…</p>;
  if (data.results.length === 0) return <p className="text-sm text-gray-500">No one matched "{query}".</p>;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        {data.total_matches} match{data.total_matches !== 1 ? 'es' : ''} across all categories{data.total_matches > data.results.length ? ` (showing ${data.results.length})` : ''}
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {data.results.map((person) => (
          <div key={`${person.section}-${person.id}`} className="relative">
            <span className="absolute top-2 right-2 z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">{person.section_label}</span>
            <PersonCard person={person} onClick={() => onOpenPerson(person.section, person.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BiographyLibrary() {
  const [overview, setOverview] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [openPerson, setOpenPerson] = useState(null);
  const [query, setQuery] = useState('');
  useEffect(() => { fetch(`${API}/biographies`).then((r) => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (openPerson) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <PersonDetail section={openPerson.section} personId={openPerson.personId} onBack={() => setOpenPerson(null)} />
      </div>
    );
  }
  if (selectedSection) return <div className="max-w-3xl mx-auto p-4"><SectionView section={selectedSection} onBack={() => setSelectedSection(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">🧑‍🎓 Biography Library</h1>
      <p className="text-gray-500 mb-2">{overview.description}</p>
      <p className="text-xs text-gray-400 mb-4">{overview.total_people} real people, each profile grounded in verified facts, with a portrait, links, and video.</p>
      <input
        type="search"
        aria-label="Search all biographies"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Search every category by name, field, or nationality…"
        className="w-full rounded-lg border px-3 py-2 mb-6 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />
      {query.trim() ? (
        <SearchResults query={query} onOpenPerson={(section, personId) => setOpenPerson({ section, personId })} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {overview.sections.map((section) => (
            <button key={section.id} onClick={() => setSelectedSection(section)}
              className="text-left rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 hover:shadow-lg transition-shadow">
              <p className="text-3xl mb-2">{section.emoji}</p>
              <p className="font-bold text-gray-800">{section.label}</p>
              <p className="text-xs text-gray-500 mt-1">{section.person_count} people</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
