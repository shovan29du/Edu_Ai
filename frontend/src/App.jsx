import React, { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import GradeSelector from './components/GradeSelector.jsx';
import SyllabusCard from './components/SyllabusCard.jsx';
import ProgressDashboard from './components/ProgressDashboard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SearchBar from './components/SearchBar.jsx';
import ResourceLibrary from './components/ResourceLibrary.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import { fetchGrade } from './api/grade.js';

const TABS = ['Subjects', 'Library', 'Search', 'Code Editor'];

export default function App() {
  const [standard, setStandard] = useState(1);
  const [grade, setGrade] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Subjects');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGrade(standard)
      .then((data) => {
        setGrade(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setGrade(null);
        setLoading(false);
      });
  }, [standard]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 p-4">
        <GradeSelector standard={standard} onChange={setStandard} />
        <ProgressDashboard />

        <div role="tablist" aria-label="Main sections" className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded border px-3 py-1 focus:outline focus:outline-2 focus:outline-blue-500 ${
                activeTab === tab ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <LoadingSpinner />}
        {error && <p role="alert" className="text-red-600">{error}</p>}

        {!loading && !error && activeTab === 'Subjects' &&
          grade &&
          Object.entries(grade.subjects).map(([name, subject]) => (
            <SyllabusCard key={name} subjectName={name} subject={subject} />
          ))}

        {!loading && !error && activeTab === 'Library' && <ResourceLibrary grade={grade} />}

        {!loading && !error && activeTab === 'Search' && <SearchBar standard={standard} />}

        {activeTab === 'Code Editor' && <CodeEditor />}
      </main>
    </div>
  );
}
