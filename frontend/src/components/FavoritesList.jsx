import React from 'react';
import { useFavorites } from '../hooks/useFavorites.js';
import FavoriteButton from './FavoriteButton.jsx';

export default function FavoritesList() {
  const { favorites } = useFavorites();

  return (
    <section aria-label="Favourites" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">My Favourites</h2>
      {favorites.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Nothing favourited yet — tap ☆ Favourite on a book, video, or infographic to save it here.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {favorites.map((item, i) => (
            <li key={i} className="rounded border p-3 dark:border-gray-700">
              <a
                href={item.link || item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {item.title}
              </a>
              <div className="mt-1">
                <FavoriteButton resource={item} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
