import React, { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import GradeSelector from './components/GradeSelector.jsx';
import SubjectLessons from './components/SubjectLessons.jsx';
import ProgressDashboard from './components/ProgressDashboard.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SearchBar from './components/SearchBar.jsx';
import ResourceLibrary from './components/ResourceLibrary.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import ColouringCanvas from './components/ColouringCanvas.jsx';
import ParentCuration from './components/ParentCuration.jsx';
import FavoritesList from './components/FavoritesList.jsx';
import ParentProgressOverview from './components/ParentProgressOverview.jsx';
import StudyTimer from './components/StudyTimer.jsx';
import FactOfTheDay from './components/FactOfTheDay.jsx';
import SafeMusicPlayer from './components/SafeMusicPlayer.jsx';
import { useChild, isParentProfile } from './contexts/ChildContext.jsx';
import { fetchGrade } from './api/grade.js';

const CHILD_TABS = [
  'Subjects',
  'Library',
  'Search',
  'Favourites',
  'Colouring',
  'Code Editor',
  'Study Timer',
  'Fact of the Day',
  'Music',
];
const PARENT_TABS = ['Overview', 'Library', 'Search', 'Curate'];

export default function App() {
  const { child } = useChild();
  const isParent = isParentProfile(child);
  const tabs = isParent ? PARENT_TABS : CHILD_TABS;

  const [standard, setStandard] = useState(1);
  const [grade, setGrade] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [isParent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGrade(standard)
      .then((data) => {
        setGrade(data);
        setActiveSubject(Object.keys(data.subjects || {})[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setGrade(null);
        setActiveSubject(null);
        setLoading(false);
      });
  }, [standard]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 p-4">
        <GradeSelector standard={standard} onChange={setStandard} />
        <ProgressDashboard />

        <div role="tablist" aria-label="Main sections" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
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

        {!loading && !error && activeTab === 'Subjects' && grade && (
          <div className="space-y-4">
            <label className="flex flex-col text-sm font-medium">
              Subject
              <select
                value={activeSubject || ''}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="mt-1 rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                {Object.keys(grade.subjects).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            {activeSubject && grade.subjects[activeSubject] && (
              <SubjectLessons
                key={activeSubject}
                subjectName={activeSubject}
                subject={grade.subjects[activeSubject]}
                standard={standard}
                onChangeGrade={setStandard}
              />
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'Library' && <ResourceLibrary grade={grade} />}

        {!loading && !error && activeTab === 'Search' && <SearchBar standard={standard} />}

        {activeTab === 'Favourites' && <FavoritesList />}

        {activeTab === 'Colouring' && <ColouringCanvas />}

        {activeTab === 'Code Editor' && <CodeEditor />}

        {activeTab === 'Study Timer' && <StudyTimer />}

        {activeTab === 'Fact of the Day' && <FactOfTheDay grade={grade} />}

        {activeTab === 'Music' && <SafeMusicPlayer />}

        {activeTab === 'Curate' && <ParentCuration standard={standard} />}

        {activeTab === 'Overview' && <ParentProgressOverview />}
      </main>
    </div>
  );
}
