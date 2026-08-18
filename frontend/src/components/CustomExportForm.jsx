import React, { useEffect, useState } from 'react';
import { fetchGrade } from '../api/grade.js';
import { downloadFile } from '../utils/download.js';

export default function CustomExportForm({ standard, resourceTypeLabels }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrade(standard)
      .then((data) => setSubjects(Object.keys(data.subjects || {})))
      .catch(() => setSubjects([]));
  }, [standard]);

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleExport(e) {
    e.preventDefault();
    setError(null);
    try {
      await downloadFile(
        `/api/grade/${standard}/export/custom`,
        `grade${standard}-custom.${format}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjects: selectedSubjects,
            resource_types: selectedTypes,
            format,
          }),
        }
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form
      onSubmit={handleExport}
      aria-label="Customize syllabus export"
      className="mb-4 rounded border p-3 dark:border-gray-700"
    >
      <h3 className="mb-2 font-semibold">Customize export</h3>

      <fieldset className="mb-2">
        <legend className="text-sm font-medium">Subjects (none selected = all)</legend>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <label key={s} className="text-sm">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(s)}
                onChange={() => toggle(selectedSubjects, setSelectedSubjects, s)}
              />{' '}
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-2">
        <legend className="text-sm font-medium">Resource types (none selected = all)</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(resourceTypeLabels).map(([key, label]) => (
            <label key={key} className="text-sm">
              <input
                type="checkbox"
                checked={selectedTypes.includes(key)}
                onChange={() => toggle(selectedTypes, setSelectedTypes, key)}
              />{' '}
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-2">
        <legend className="text-sm font-medium">Format</legend>
        <label className="mr-3 text-sm">
          <input
            type="radio"
            name="format"
            value="pdf"
            checked={format === 'pdf'}
            onChange={() => setFormat('pdf')}
          />{' '}
          PDF
        </label>
        <label className="text-sm">
          <input
            type="radio"
            name="format"
            value="docx"
            checked={format === 'docx'}
            onChange={() => setFormat('docx')}
          />{' '}
          DOC (.docx)
        </label>
      </fieldset>

      <button
        type="submit"
        className="rounded border px-3 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
      >
        Export
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
