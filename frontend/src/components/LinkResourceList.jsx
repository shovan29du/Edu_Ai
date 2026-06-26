import React from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function LinkResourceList({ title, items }) {
  const { isRestricted } = useChild();
  const visible = (items || []).filter((item) => !isRestricted || isResourceSafe(item));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <ul className="space-y-1">
        {visible.map((item, i) => (
          <li key={i} className="rounded border p-2 dark:border-gray-700">
            <a
              href={item.link || item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {item.title}
            </a>
            {(item.source || item.description) && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.source || item.description}
              </p>
            )}
            <div className="mt-1">
              <FavoriteButton resource={item} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
