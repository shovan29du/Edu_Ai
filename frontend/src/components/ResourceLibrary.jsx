import React, { useMemo, useState } from 'react';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import DownloadArticleButton from './DownloadArticleButton.jsx';

const TYPE_LABELS = {
  books: 'Books',
  video_resources: 'Videos',
  text_resources: 'Text',
  cartoon_videos: 'Cartoons',
  infographics: 'Infographics',
  textbooks: 'Textbooks',
  audio_resources: 'Audio',
  comics: 'Comics',
  drawing_activities: 'Drawing',
  info_cards: 'Info Cards',
  podcasts: 'Podcasts',
  news_resources: 'News',
};

export default function ResourceLibrary({ grade }) {
  const { isRestricted } = useChild();
  const [activeType, setActiveType] = useState('books');

  const items = useMemo(() => {
    if (!grade) return [];
    const collected = [];
    for (const [subjectName, subject] of Object.entries(grade.subjects || {})) {
      for (const resource of subject[activeType] || []) {
        if (!isRestricted || isResourceSafe(resource)) {
          collected.push({ ...resource, subject: subjectName });
        }
      }
    }
    return collected;
  }, [grade, activeType, isRestricted]);

  if (!grade) return null;

  return (
    <section aria-label="Resource library" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Resource Library — Standard {grade.standard}</h2>
      <div role="tablist" aria-label="Resource type" className="mb-3 flex gap-2">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            role="tab"
            aria-selected={activeType === type}
            onClick={() => setActiveType(type)}
            className={`rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 ${
              activeType === type ? 'bg-blue-600 text-white' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No {TYPE_LABELS[activeType].toLowerCase()} available.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="rounded border p-3 dark:border-gray-700">
              {item.link || item.url ? (
                <a
                  href={item.link || item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {item.title}
                </a>
              ) : (
                <p className="font-medium">{item.title}</p>
              )}
              {item.fact && <p className="text-sm text-gray-700 dark:text-gray-300">{item.fact}</p>}
              {item.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.subject}</p>
              {activeType === 'news_resources' && (
                <div className="mt-2 flex gap-2">
                  <DownloadArticleButton resource={item} format="txt" />
                  <DownloadArticleButton resource={item} format="docx" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
