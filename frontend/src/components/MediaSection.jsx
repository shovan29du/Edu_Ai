import React from 'react';
import ReactPlayer from 'react-player';
import { isResourceSafe } from '../utils/safetyFilter.js';
import { useChild } from '../contexts/ChildContext.jsx';
import ReadAloudButton from './ReadAloudButton.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function MediaSection({ title, videos }) {
  const { isRestricted } = useChild();
  const visible = (videos || []).filter((v) => !isRestricted || isResourceSafe(v));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((video, i) => (
          <div key={i} className="rounded border dark:border-gray-700">
            <ReactPlayer url={video.url} controls width="100%" height="180px" />
            <div className="p-2">
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
              <div className="mt-1 flex gap-2">
                <ReadAloudButton text={`${video.title}. ${video.description || ''}`} />
                <FavoriteButton resource={video} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
