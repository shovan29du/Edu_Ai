import { useState, useEffect } from 'react';

const API = '/api';

function BookDetail({ category, bookId, onBack }) {
  const [book, setBook] = useState(null);
  useEffect(() => {
    fetch(`${API}/nonfiction/${category}/${bookId}`).then(r => r.json()).then(setBook);
  }, [category, bookId]);
  if (!book) return <div className="p-4 text-gray-500">Loading…</div>;
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">← Back</button>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{book.title}</h2>
      <p className="text-sm text-gray-500 mb-4">Ages {book.age_range}</p>
      <div className="prose max-w-none mb-5">
        <p className="text-gray-700 leading-relaxed">{book.summary}</p>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
        <h3 className="font-semibold text-amber-800 mb-2">⭐ Key Facts</h3>
        <ul className="space-y-1">
          {book.key_facts?.map((f, i) => (
            <li key={i} className="text-sm text-amber-900 flex gap-2"><span>•</span>{f}</li>
          ))}
        </ul>
      </div>
      {book.discussion?.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">💬 Discussion Questions</h3>
          <ol className="space-y-1">
            {book.discussion.map((q, i) => (
              <li key={i} className="text-sm text-blue-900">{i + 1}. {q}</li>
            ))}
          </ol>
        </div>
      )}
      {book.related_subjects?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {book.related_subjects.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-600">{s}</span>
          ))}
        </div>
      )}
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
      <button onClick={onBack} className="mb-3 text-sm text-blue-600 hover:underline">← All Categories</button>
      <h2 className="text-2xl font-bold mb-4">{category.emoji} {category.label}</h2>
      {!data ? <p className="text-gray-400">Loading…</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.books?.map(book => (
            <button key={book.id} onClick={() => setSelectedBook(book.id)}
              className="text-left rounded-xl border-2 border-amber-200 bg-amber-50 p-4 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800">{book.title}</p>
              <p className="text-xs text-gray-500 mt-1">Ages {book.age_range}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{book.summary?.slice(0, 120)}…</p>
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
      <p className="text-gray-500 mb-6">{overview.description}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {overview.categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat)}
            className="text-left rounded-xl border-2 border-amber-200 bg-amber-50 p-5 hover:shadow-lg transition-shadow">
            <p className="text-3xl mb-2">{cat.emoji}</p>
            <p className="font-bold text-gray-800">{cat.label}</p>
            <p className="text-xs text-amber-700 mt-1">{cat.book_count} article{cat.book_count !== 1 ? 's' : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
