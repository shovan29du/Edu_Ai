import React, { useEffect, useState } from 'react';
import {
  listResourceTabDocuments,
  uploadResourceTabDocument,
  deleteResourceTabDocument,
  resourceTabDownloadUrl,
} from '../api/resourceTab.js';

export default function ResourceTab() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  function refresh() {
    setLoading(true);
    setError(null);
    listResourceTabDocuments()
      .then((docs) => {
        setDocuments(docs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadResourceTabDocument(file);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteResourceTabDocument(id);
      setDocuments((docs) => docs.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section aria-label="Resource Tab" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-2 text-lg font-bold">📁 Resource Tab</h2>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        Upload your own PDF, Word, or text documents here. We'll read them and show which
        syllabus topics they relate to.
      </p>

      <label className="mb-4 inline-block">
        <span className="sr-only">Upload a document</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={uploading}
          className="block text-sm"
        />
      </label>
      {uploading && <p className="text-sm text-gray-600 dark:text-gray-300">Uploading and analysing…</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}

      {loading && <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>}

      {!loading && documents.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300">No documents uploaded yet.</p>
      )}

      <ul className="space-y-3">
        {documents.map((doc) => (
          <li key={doc.id} className="rounded border p-3 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <a
                href={resourceTabDownloadUrl(doc.id)}
                className="font-medium text-blue-600 underline dark:text-blue-400"
              >
                {doc.filename}
              </a>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                className="rounded border px-2 py-1 text-xs focus:outline focus:outline-2 focus:outline-blue-500"
              >
                Remove
              </button>
            </div>
            {doc.summary && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{doc.summary}</p>
            )}
            {doc.matched_topics?.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {doc.matched_topics.map((m, i) => (
                  <span
                    key={i}
                    className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Grade {m.grade} · {m.subject}: {m.topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                No matching syllabus topics found for this document yet.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
