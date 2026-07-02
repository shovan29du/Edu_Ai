import { useState, useEffect } from 'react';

const API = '/api';

function BookDetail({ section, bookId, onBack }) {
  const [book, setBook] = useState(null);
  useEffect(() => {
    fetch(`${API}/world-literature/${section}/${bookId}`).then(r => r.json()).then(setBook);
  }, [section, bookId]);
  if (!book) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-emerald-600 hover:underline">← Back to books</button>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{book.title}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✍️ {book.author}</span>
        {book.year && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">📅 {book.year}</span>}
        {book.origin && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">🌍 {book.origin}</span>}
        {book.genre && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{book.genre}</span>}
        {book.age && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Age {book.age}</span>}
      </div>
      <p className="text-gray-700 leading-relaxed mb-5">{book.summary}</p>
      {book.themes?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">🔑 Themes</h3>
          <div className="flex flex-wrap gap-1">
            {book.themes.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-sm bg-emerald-50 border border-emerald-200 text-emerald-700">{t}</span>
            ))}
          </div>
        </div>
      )}
      {book.discussion?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💬 Discussion Questions</h3>
          <ol className="space-y-1">
            {book.discussion.map((q, i) => (
              <li key={i} className="text-sm text-blue-900">{i + 1}. {q}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function SectionView({ section, onBack }) {
  const [data, setData] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  useEffect(() => {
    fetch(`${API}/world-literature/${section.id}`).then(r => r.json()).then(setData);
  }, [section.id]);
  if (selectedBook) return <BookDetail section={section.id} bookId={selectedBook} onBack={() => setSelectedBook(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-emerald-600 hover:underline">← All Sections</button>
      <h2 className="text-2xl font-bold mb-1">{section.emoji} {section.label}</h2>
      <p className="text-sm text-gray-500 mb-4">Ages {section.age_range}</p>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.books?.map(book => (
            <button key={book.id} onClick={() => setSelectedBook(book.id)}
              className="text-left rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800">{book.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{book.author} · {book.year} · {book.origin}</p>
              <div className="flex gap-1 mt-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{book.genre}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Age {book.age}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{book.summary?.slice(0, 100)}…</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldLiteratureLibrary() {
  const [overview, setOverview] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  useEffect(() => { fetch(`${API}/world-literature`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedSection) return <div className="max-w-3xl mx-auto p-4"><SectionView section={selectedSection} onBack={() => setSelectedSection(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">📚 World Literature Library</h1>
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {overview.sections.map(section => (
          <button key={section.id} onClick={() => setSelectedSection(section)}
            className="text-left rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{section.emoji}</p>
            <p className="font-bold text-gray-800">{section.label}</p>
            <p className="text-xs text-gray-500 mt-1">Ages {section.age_range}</p>
            <p className="text-xs text-emerald-600 mt-1">{section.book_count} title{section.book_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
