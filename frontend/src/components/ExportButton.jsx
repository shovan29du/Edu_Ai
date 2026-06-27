import React, { useState } from 'react';
import { downloadFile } from '../utils/download.js';

export default function ExportButton({ url, fallbackFilename, label, options }) {
  const [error, setError] = useState(null);

  async function handleClick() {
    try {
      setError(null);
      await downloadFile(url, fallbackFilename, options);
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
        {label}
      </button>
      {error && (
        <span role="alert" className="ml-2 text-sm text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
