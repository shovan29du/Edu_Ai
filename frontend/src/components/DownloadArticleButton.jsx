import React, { useState } from 'react';
import { downloadFile } from '../utils/download.js';

export default function DownloadArticleButton({ resource, format = 'txt' }) {
  const [error, setError] = useState(null);

  async function handleClick() {
    try {
      setError(null);
      await downloadFile('/api/resource/download', `${resource.title || 'resource'}.${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resource.title,
          body: resource.body,
          url: resource.url,
          source: resource.source,
          image: resource.image,
          format,
        }),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={handleClick}
        className="rounded border px-2 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
      >
        Download {format === 'docx' ? 'with media' : 'text'}
      </button>
      {error && (
        <span role="alert" className="ml-2 text-sm text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
