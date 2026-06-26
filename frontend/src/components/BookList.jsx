import React from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import ReadAloudButton from './ReadAloudButton.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function BookList({ books }) {
  const { isRestricted } = useChild();
  const visible = (books || []).filter((b) => !isRestricted || isResourceSafe(b));

  if (visible.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {visible.map((book) => (
        <li key={book.id} className="rounded border p-3 dark:border-gray-700">
          <a
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {book.title}
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {book.author} · {book.source} · ⭐ {book.rating}
          </p>
          <div className="mt-1 flex gap-2">
            <ReadAloudButton text={`${book.title} by ${book.author}`} />
            <FavoriteButton resource={book} />
          </div>
        </li>
      ))}
    </ul>
  );
}
