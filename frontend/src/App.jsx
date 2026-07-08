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
const VocabularyAcademy = lazy(() => import('./components/VocabularyAcademy.jsx'));
const StemLab = lazy(() => import('./components/StemLab.jsx'));
const NonfictionLibrary = lazy(() => import('./components/NonfictionLibrary.jsx'));
const PracticalSkills = lazy(() => import('./components/PracticalSkills.jsx'));
const VirtualMuseum = lazy(() => import('./components/VirtualMuseum.jsx'));
const WorldLiteratureLibrary = lazy(() => import('./components/WorldLiteratureLibrary.jsx'));
const CriticalThinking = lazy(() => import('./components/CriticalThinking.jsx'));
const SurvivalSkills = lazy(() => import('./components/SurvivalSkills.jsx'));
const WorldPolitics = lazy(() => import('./components/WorldPolitics.jsx'));
const MathTools = lazy(() => import('./components/MathTools.jsx'));
const HealthEducation = lazy(() => import('./components/HealthEducation.jsx'));
const BusinessStudies = lazy(() => import('./components/BusinessStudies.jsx'));
const AttendanceTracker = lazy(() => import('./components/AttendanceTracker.jsx'));
const Civics = lazy(() => import('./components/Civics.jsx'));
const WeeklyReport = lazy(() => import('./components/WeeklyReport.jsx'));
const BrainTeasers = lazy(() => import('./components/BrainTeasers.jsx'));
const EnvironmentalScience = lazy(() => import('./components/EnvironmentalScience.jsx'));
const WorldReligions = lazy(() => import('./components/WorldReligions.jsx'));
const SongCentre = lazy(() => import('./components/SongCentre.jsx'));
const UserManager = lazy(() => import('./components/UserManager.jsx'));
const CMACollection = lazy(() => import('./components/CMACollection.jsx'));
const MoviesLibrary = lazy(() => import('./components/MoviesLibrary.jsx'));

const CHILD_TABS = [
  'Subjects',
  'Library',
  'Search',
  'Favourites',
  'AI Tutor',
  'Languages',
  'Grammar',
  'Vocabulary',
  'STEM Lab',
  'Non-Fiction',
  'Practical Skills',
  'Museum',
  'Art Collection',
  'World Lit',
  'Critical Thinking',
  'Survival Skills',
  'Brain Teasers',
  'Environment',
  'World Politics',
  'World Religions',
  'Math Tools',
  'Health',
  'Business',
  'Civics',
  'Countries',
  'Assessment',
  'Colouring',
  'Code Editor',
  'Study Timer',
  'Fact of the Day',
  'History of the Day',
  'Music',
  'Song Centre',
  'Sing-Along',
  'Movies',
  'Games',
  'Appearance',
  'Resource Tab',
];
// Shovan & Bely get everything: all child tabs + parent admin tabs
const SHOVAN_BELY_TABS = [
  ...CHILD_TABS.filter((t) => t !== 'Resource Tab'),
  'Overview', 'Attendance', 'Weekly Report', 'Curate', 'Resource Tab',
];

const PARENT_TABS = ['Overview', 'Attendance', 'Weekly Report', 'Library', 'Search', 'Curate', 'Users', 'Resource Tab'];

export default function App() {
  const { child } = useChild();
  const isParent = isParentProfile(child);
  const isShovanOrBely = child === 'Shovan' || child === 'Bely';
  const tabs = isShovanOrBely ? SHOVAN_BELY_TABS : isParent ? PARENT_TABS : CHILD_TABS;

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
  }, [isParent, isShovanOrBely]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {error && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
            <p className="font-semibold">Could not load grade data</p>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-2 text-sm">Make sure the backend is running: <code className="rounded bg-red-100 px-1 dark:bg-red-900">bash start.sh</code></p>
          </div>
        )}

        <Suspense fallback={<LoadingSpinner />}>
          {!loading && !error && activeTab === 'Subjects' && grade && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Choose a subject to start learning:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(grade.subjects).map((name) => (
                    <button
                      key={name}
                      onClick={() => setActiveSubject(name)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline focus:outline-2 focus:outline-blue-500 ${
                        activeSubject === name
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
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
          {activeTab === 'Attendance' && <AttendanceTracker />}
          {activeTab === 'Weekly Report' && <WeeklyReport />}

          {activeTab === 'Resource Tab' && <ResourceTab />}

          {activeTab === 'Users' && <UserManager />}

          {activeTab === 'AI Tutor' && <AiTutor standard={standard} subjectName={activeSubject || ''} />}

          {activeTab === 'Languages' && <LanguageAcademy />}

          {activeTab === 'Grammar' && <GrammarAcademy />}
          {activeTab === 'Vocabulary' && <VocabularyAcademy />}
          {activeTab === 'STEM Lab' && <StemLab />}
          {activeTab === 'Non-Fiction' && <NonfictionLibrary />}
          {activeTab === 'Practical Skills' && <PracticalSkills />}
          {activeTab === 'Museum' && <VirtualMuseum />}
          {activeTab === 'Art Collection' && <CMACollection />}
          {activeTab === 'World Lit' && <WorldLiteratureLibrary />}
          {activeTab === 'Critical Thinking' && <CriticalThinking />}
          {activeTab === 'Survival Skills' && <SurvivalSkills />}
          {activeTab === 'Brain Teasers' && <BrainTeasers />}
          {activeTab === 'Environment' && <EnvironmentalScience />}
          {activeTab === 'World Politics' && <WorldPolitics />}
          {activeTab === 'World Religions' && <WorldReligions />}
          {activeTab === 'Song Centre' && <SongCentre />}
          {activeTab === 'Movies' && <MoviesLibrary />}
          {activeTab === 'Math Tools' && <MathTools />}
          {activeTab === 'Health' && <HealthEducation />}
          {activeTab === 'Business' && <BusinessStudies />}
          {activeTab === 'Civics' && <Civics />}

          {activeTab === 'Countries' && <CountriesExplorer />}

          {activeTab === 'Assessment' && <AssessmentCentre />}
        </Suspense>
      </main>
    </div>
  );
}
