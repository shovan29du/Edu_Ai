import { useState, useEffect } from 'react';
import { SpeakButton } from '../utils/tts.jsx';

const API = '/api';

function LinkBar({ links }) {
  if (!links) return null;
  const items = [
    links.read_online && { href: links.read_online, label: '📖 Read Free', color: 'bg-green-100 text-green-700 border-green-200' },
    links.download_epub && { href: links.download_epub, label: '⬇ Download EPUB', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    links.open_library && { href: links.open_library, label: '🏛 Open Library', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    links.video_summary && { href: links.video_summary, label: '▶ Video Review', color: 'bg-red-100 text-red-700 border-red-200' },
    links.podcast && { href: links.podcast, label: '🎙 Podcast', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    links.wikipedia && { href: links.wikipedia, label: 'ℹ Wikipedia', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="mt-5 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">🔗 Links & Downloads</h3>
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

function BookDetail({ category, bookId, onBack }) {
  const [book, setBook] = useState(null);
  useEffect(() => {
    fetch(`${API}/nonfiction/${category}/${bookId}`).then(r => r.json()).then(setBook);
  }, [category, bookId]);
  if (!book) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-amber-600 hover:underline">← Back</button>
      <div className="flex items-start gap-2 mb-1">
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{book.title}</h2>
        <SpeakButton text={`${book.title}. ${book.summary}`} lang="en" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {book.author && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">✍️ {book.author}</span>}
        {book.year && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">📅 {book.year}</span>}
        {book.age_range && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Ages {book.age_range}</span>}
        {book.pages && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{book.pages} pages</span>}
      </div>
      <div className="prose max-w-none mb-5">
        <p className="text-gray-700 leading-relaxed">{book.summary}</p>
      </div>
      {book.key_ideas?.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <h3 className="font-semibold text-amber-800 mb-2">💡 Key Ideas</h3>
          <div className="flex flex-wrap gap-1">
            {book.key_ideas.map((idea, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-amber-100 border border-amber-200 text-amber-800">{idea}</span>
            ))}
          </div>
        </div>
      )}
      {book.key_facts?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">⭐ Key Facts</h3>
          <ul className="space-y-1">
            {book.key_facts.map((f, i) => (
              <li key={i} className="text-sm text-blue-900 flex gap-2"><span>•</span>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {book.discussion?.length > 0 && (
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 mb-4">
          <h3 className="font-semibold text-purple-800 mb-2">💬 Discussion Questions</h3>
          <ol className="space-y-1">
            {book.discussion.map((q, i) => (
              <li key={i} className="text-sm text-purple-900">{i + 1}. {q}</li>
            ))}
          </ol>
        </div>
      )}
      {book.related_subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 mb-4">
          {book.related_subjects.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-600">{s}</span>
          ))}
        </div>
      )}
      <LinkBar links={book.links} />
    </div>
  );
}

function CategoryView({ category, onBack }) {
  const [data, setData] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  useEffect(() => {
    fetch(`${API}/nonfiction/${category.id}`).then(r => r.json()).then(setData);
  }, [category.id]);
  if (selectedBook) return <BookDetail category={category.id} bookId={selectedBook} onBack={() => setSelectedBook(null)} />;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-amber-600 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-4">{category.emoji} {category.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.books?.map(book => (
            <button key={book.id} onClick={() => setSelectedBook(book.id)}
              className="text-left rounded-xl border-2 border-amber-200 bg-amber-50 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800">{book.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{book.author} · {book.year}</p>
              <p className="text-xs text-gray-400 mt-0.5">Ages {book.age_range}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{book.summary?.slice(0, 120)}…</p>
              {book.links && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {book.links.read_online && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">📖 Free</span>}
                  {book.links.video_summary && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">▶ Video</span>}
                  {book.links.podcast && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">🎙 Podcast</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NonfictionLibrary() {
  const [overview, setOverview] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  useEffect(() => { fetch(`${API}/nonfiction`).then(r => r.json()).then(setOverview); }, []);
  if (!overview) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (selectedCat) return <div className="max-w-3xl mx-auto p-4"><CategoryView category={selectedCat} onBack={() => setSelectedCat(null)} /></div>;
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">📚 Non-Fiction Library</h1>
      <p className="text-gray-500 mb-2">{overview.description}</p>
      <p className="text-xs text-gray-400 mb-6">Every book includes free/library links, video reviews, and podcast episodes.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overview.categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat)}
            className="text-left rounded-xl border-2 border-amber-200 bg-amber-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{cat.emoji}</p>
            <p className="font-bold text-gray-800">{cat.label}</p>
            <p className="text-xs text-amber-700 mt-1">{cat.book_count} title{cat.book_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
