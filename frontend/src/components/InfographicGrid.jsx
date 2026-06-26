import React from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function InfographicGrid({ infographics }) {
  const { isRestricted } = useChild();
  const visible = (infographics || []).filter((g) => !isRestricted || isResourceSafe(g));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Infographics</h3>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((item, i) => (
          <li key={i} className="rounded border p-2 dark:border-gray-700">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <img
                src={item.image || item.url}
                alt={item.title}
                className="mb-2 h-32 w-full rounded object-cover"
                loading="lazy"
              />
              <p className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {item.title}
              </p>
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.source}</p>
            <div className="mt-1">
              <FavoriteButton resource={item} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
