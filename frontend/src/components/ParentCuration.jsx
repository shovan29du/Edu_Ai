import React, { useState } from 'react';
import { webSearch, curateResource, uploadAndSummarizeBook } from '../api/curate.js';
import ExportButton from './ExportButton.jsx';
import CustomExportForm from './CustomExportForm.jsx';

const RESOURCE_TYPES = {
  books: 'Book',
  video_resources: 'Video',
  text_resources: 'Text',
  cartoon_videos: 'Cartoon',
  infographics: 'Infographic',
  textbooks: 'Textbook',
  audio_resources: 'Audio',
  comics: 'Comic',
  drawing_activities: 'Drawing Activity',
  info_cards: 'Info Card',
  podcasts: 'Podcast',
  news_resources: 'News Article',
};

export default function ParentCuration({ standard }) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [resourceType, setResourceType] = useState('video_resources');
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [addedUrls, setAddedUrls] = useState([]);
  const [addError, setAddError] = useState(null);
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setSearchError(null);
    try {
      const data = await webSearch(query);
      setResults(data);
    } catch (err) {
      setSearchError(err.message);
      setResults(null);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError(null);
    setUploadResult(null);
    const file = e.target.elements.bookFile.files[0];
    if (!file) {
      setUploadError('Choose a file to upload.');
      return;
    }
    if (!uploadSubject.trim()) {
      setUploadError('Enter a subject name before uploading a book.');
      return;
    }
    try {
      const data = await uploadAndSummarizeBook({ file, standard, subject: uploadSubject.trim() });
      setUploadResult(data);
    } catch (err) {
      setUploadError(err.message);
    }
  }

  async function handleAdd(result) {
    setAddError(null);
    if (!subject.trim()) {
      setAddError('Enter a subject name before adding a resource.');
      return;
    }
    try {
      await curateResource({
        standard,
        subject: subject.trim(),
        resourceType,
        resource: {
          title: result.title,
          url: result.url,
          link: result.url,
          description: result.description,
        },
      });
      setAddedUrls((prev) => [...prev, result.url]);
    } catch (err) {
      setAddError(err.message);
    }
  }

  return (
    <section aria-label="Parent resource curation" className="rounded border p-4 dark:border-gray-700">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-bold">Curate New Resources — Standard {standard}</h2>
        <span className="flex gap-2">
          <ExportButton
            url={`/api/grade/${standard}/export?format=json`}
            fallbackFilename={`grade${standard}-syllabus.json`}
            label="Export JSON"
          />
          <ExportButton
            url={`/api/grade/${standard}/export?format=csv`}
            fallbackFilename={`grade${standard}-syllabus.csv`}
            label="Export CSV"
          />
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Search the live web for resources, review each result, then add the ones you approve to
        this grade's syllabus. Nothing is shown to children until you add it here.
      </p>

      <CustomExportForm standard={standard} resourceTypeLabels={RESOURCE_TYPES} />

      <form onSubmit={handleUpload} className="mb-4 flex flex-wrap items-end gap-2 rounded border p-2 dark:border-gray-700">
        <label className="flex flex-col text-sm">
          Upload a book (.txt or .pdf) to summarize and add as a text resource
          <input
            type="file"
            name="bookFile"
            accept=".txt,.pdf"
            className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="flex flex-col text-sm">
          Subject for upload
          <input
            type="text"
            value={uploadSubject}
            onChange={(e) => setUploadSubject(e.target.value)}
            placeholder="e.g. World Literature"
            className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <button
          type="submit"
          className="rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Upload & summarize
        </button>
      </form>
      {uploadError && (
        <p role="alert" className="mb-3 text-red-600">
          {uploadError}
        </p>
      )}
      {uploadResult && (
        <div className="mb-4 rounded border border-green-500 p-2 text-sm">
          <p className="font-medium">
            {uploadResult.added_resource ? 'Added to syllabus ✓' : 'Summarized (not added — set a subject to add it)'}
          </p>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{uploadResult.summary}</p>
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-3 flex flex-wrap gap-2">
        <label className="flex flex-col text-sm">
          Search query
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. free phonics videos for grade 1"
            className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="flex flex-col text-sm">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Math"
            className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
          />
        </label>
        <label className="flex flex-col text-sm">
          Resource type
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
          >
            {Object.entries(RESOURCE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Search web
        </button>
      </form>

      {searchError && (
        <p role="alert" className="mb-3 text-red-600">
          {searchError}
        </p>
      )}
      {addError && (
        <p role="alert" className="mb-3 text-red-600">
          {addError}
        </p>
      )}

      {results && (
        <ul className="space-y-2" aria-label="Web search results">
          {results.length === 0 && <li className="text-gray-600 dark:text-gray-400">No results.</li>}
          {results.map((r, i) => (
            <li key={i} className="rounded border p-2 dark:border-gray-700">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {r.title}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400">{r.description}</p>
              <button
                type="button"
                onClick={() => handleAdd(r)}
                disabled={addedUrls.includes(r.url)}
                className="mt-1 rounded border px-2 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500 disabled:opacity-50"
              >
                {addedUrls.includes(r.url) ? 'Added ✓' : 'Add to syllabus'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
