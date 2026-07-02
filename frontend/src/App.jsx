import React, { useEffect, useState, Suspense, lazy } from 'react';
import Header from './components/Header.jsx';
import GradeSelector from './components/GradeSelector.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useChild, isParentProfile } from './contexts/ChildContext.jsx';
import { fetchGrade } from './api/grade.js';

const ProgressDashboard = lazy(() => import('./components/ProgressDashboard.jsx'));
const SubjectLessons = lazy(() => import('./components/SubjectLessons.jsx'));
const SearchBar = lazy(() => import('./components/SearchBar.jsx'));
const ResourceLibrary = lazy(() => import('./components/ResourceLibrary.jsx'));
const CodeEditor = lazy(() => import('./components/CodeEditor.jsx'));
const ColouringCanvas = lazy(() => import('./components/ColouringCanvas.jsx'));
const ParentCuration = lazy(() => import('./components/ParentCuration.jsx'));
const FavoritesList = lazy(() => import('./components/FavoritesList.jsx'));
const ParentProgressOverview = lazy(() => import('./components/ParentProgressOverview.jsx'));
const StudyTimer = lazy(() => import('./components/StudyTimer.jsx'));
const FactOfTheDay = lazy(() => import('./components/FactOfTheDay.jsx'));
const SafeMusicPlayer = lazy(() => import('./components/SafeMusicPlayer.jsx'));
const SingAlong = lazy(() => import('./components/SingAlong.jsx'));
const Games = lazy(() => import('./components/Games.jsx'));
const HistoryOfTheDay = lazy(() => import('./components/HistoryOfTheDay.jsx'));
const AppearanceSettings = lazy(() => import('./components/AppearanceSettings.jsx'));
const ResourceTab = lazy(() => import('./components/ResourceTab.jsx'));
const AiTutor = lazy(() => import('./components/AiTutor.jsx'));
const LanguageAcademy = lazy(() => import('./components/LanguageAcademy.jsx'));
const AssessmentCentre = lazy(() => import('./components/AssessmentCentre.jsx'));
const GrammarAcademy = lazy(() => import('./components/GrammarAcademy.jsx'));
const CountriesExplorer = lazy(() => import('./components/CountriesExplorer.jsx'));

const CHILD_TABS = [
  'Subjects',
  'Library',
  'Search',
  'Favourites',
  'AI Tutor',
  'Languages',
  'Grammar',
  'Countries',
  'Assessment',
  'Colouring',
  'Code Editor',
  'Study Timer',
  'Fact of the Day',
  'History of the Day',
  'Music',
  'Sing-Along',
  'Games',
  'Appearance',
  'Resource Tab',
];
const PARENT_TABS = ['Overview', 'Library', 'Search', 'Curate', 'Resource Tab'];

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
        <Suspense fallback={<LoadingSpinner />}>
          <ProgressDashboard />
        </Suspense>

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

        <Suspense fallback={<LoadingSpinner />}>
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

          {activeTab === 'History of the Day' && <HistoryOfTheDay />}

          {activeTab === 'Appearance' && <AppearanceSettings />}

          {activeTab === 'Music' && <SafeMusicPlayer />}

          {activeTab === 'Sing-Along' && <SingAlong />}

          {activeTab === 'Games' && <Games grade={grade} />}

          {activeTab === 'Curate' && <ParentCuration standard={standard} />}

          {activeTab === 'Overview' && <ParentProgressOverview />}

          {activeTab === 'Resource Tab' && <ResourceTab />}

          {activeTab === 'AI Tutor' && <AiTutor standard={standard} subjectName={activeSubject || ''} />}

          {activeTab === 'Languages' && <LanguageAcademy />}

          {activeTab === 'Grammar' && <GrammarAcademy />}

          {activeTab === 'Countries' && <CountriesExplorer />}

          {activeTab === 'Assessment' && <AssessmentCentre />}
        </Suspense>
      </main>
    </div>
  );
}
