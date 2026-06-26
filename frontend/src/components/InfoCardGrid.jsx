import React from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function InfoCardGrid({ infoCards }) {
  const { isRestricted } = useChild();
  const visible = (infoCards || []).filter((c) => !isRestricted || isResourceSafe(c));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Info Cards</h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((card, i) => (
          <li
            key={i}
            className="rounded border bg-yellow-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="font-medium">{card.title}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{card.fact}</p>
            <div className="mt-1">
              <FavoriteButton resource={card} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
