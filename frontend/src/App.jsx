import React, { useEffect, useState, Suspense, lazy, Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700 p-6 text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">Something went wrong loading this section.</p>
          <p className="text-xs text-red-500 mt-1">{String(this.state.error)}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-3 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import Header from './components/Header.jsx';
import LevelSelector from './components/LevelSelector.jsx';
import UpdatePrompt from './components/UpdatePrompt.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useChild, isParentProfile } from './contexts/ChildContext.jsx';
import { fetchLevel, fetchLevelOverview, fetchLevelSubject } from './api/level.js';

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
const MoviesLibrary = lazy(() => import('./components/MoviesLibrary.jsx'));
// New components from upgrade
const KaraokeCentre = lazy(() => import('./components/KaraokeCentre.jsx'));
const MusicInstruments = lazy(() => import('./components/MusicInstruments.jsx'));
const BiographyLibrary = lazy(() => import('./components/BiographyLibrary.jsx'));
const ChessTutor = lazy(() => import('./components/ChessTutor.jsx'));
const StudyCoach = lazy(() => import('./components/StudyCoach.jsx'));
const PDFExplainer = lazy(() => import('./components/PDFExplainer.jsx'));
const PersonalizedLearningPanel = lazy(() => import('./components/PersonalizedLearningPanel.jsx'));
const ProfessionalWorkspace = lazy(() => import('./components/ProfessionalWorkspace.jsx'));

// Child-friendly backgrounds: nature, space, animals, art — rotates every 15 min
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80', // lush forest
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', // starry night
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80', // cute animals
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', // ocean
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', // mountains
  'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80', // butterflies
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1920&q=80', // galaxy
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', // rainbow meadow
];

const TAB_COLOURS = {
  // Learning / Academic
  'Subjects': 'bg-blue-600 text-white',
  'Library': 'bg-blue-500 text-white',
  'AI Tutor': 'bg-indigo-600 text-white',
  'Languages': 'bg-violet-600 text-white',
  'Grammar': 'bg-violet-500 text-white',
  'Vocabulary': 'bg-purple-600 text-white',
  'Personalized': 'bg-indigo-500 text-white',
  'Study Coach': 'bg-blue-700 text-white',
  'Assessment': 'bg-blue-800 text-white',
  // Science / STEM
  'STEM Lab': 'bg-green-600 text-white',
  'Math Tools': 'bg-green-500 text-white',
  'Environment': 'bg-emerald-600 text-white',
  'Critical Thinking': 'bg-teal-600 text-white',
  // Culture / World
  'Museum': 'bg-amber-600 text-white',
  'World Lit': 'bg-amber-500 text-white',
  'Biographies': 'bg-yellow-600 text-white',
  'Countries': 'bg-yellow-500 text-white',
  'World Politics': 'bg-orange-600 text-white',
  'World Religions': 'bg-orange-500 text-white',
  'Non-Fiction': 'bg-amber-700 text-white',
  'World Cinema': 'bg-red-600 text-white',
  // Health / Life
  'Health': 'bg-rose-500 text-white',
  'Practical Skills': 'bg-rose-600 text-white',
  'Survival Skills': 'bg-red-700 text-white',
  'Business': 'bg-pink-600 text-white',
  'Civics': 'bg-pink-500 text-white',
  // Creative / Fun
  'Colouring': 'bg-fuchsia-500 text-white',
  'Code Editor': 'bg-cyan-700 text-white',
  'Games': 'bg-lime-600 text-white',
  'Chess': 'bg-lime-700 text-white',
  'Brain Teasers': 'bg-green-700 text-white',
  // Music
  'Music': 'bg-sky-500 text-white',
  'Music & Instruments': 'bg-sky-600 text-white',
  'Song Centre': 'bg-cyan-600 text-white',
  'Sing-Along': 'bg-cyan-500 text-white',
  'Karaoke': 'bg-sky-700 text-white',
  // Utilities
  'Search': 'bg-slate-600 text-white',
  'Favourites': 'bg-red-500 text-white',
  'PDF Explainer': 'bg-slate-500 text-white',
  'Study Timer': 'bg-slate-400 text-white',
  'Fact of the Day': 'bg-yellow-700 text-white',
  'History of the Day': 'bg-stone-600 text-white',
  'Appearance': 'bg-gray-600 text-white',
  'Resource Tab': 'bg-gray-500 text-white',
  // Parent
  'Overview': 'bg-blue-900 text-white',
  'Attendance': 'bg-blue-800 text-white',
  'Weekly Report': 'bg-indigo-800 text-white',
  'Curate': 'bg-purple-800 text-white',
  'Users': 'bg-violet-900 text-white',
  'Resume': 'bg-teal-700 text-white',
};

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
  'World Lit',
  'Biographies',
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
  'Personalized',
  'Study Coach',
  'Colouring',
  'Code Editor',
  'Study Timer',
  'Fact of the Day',
  'History of the Day',
  'Music',
  'Music & Instruments',
  'Song Centre',
  'Sing-Along',
  'Karaoke',
  'World Cinema',
  'Games',
  'Chess',
  'PDF Explainer',
  'Appearance',
  'Resource Tab',
];

// Shovan & Bely get everything: all child tabs + parent admin tabs + professional tools
const SHOVAN_BELY_TABS = [
  ...CHILD_TABS.filter((t) => t !== 'Resource Tab'),
  'Overview', 'Attendance', 'Weekly Report', 'Curate', 'Resume', 'Resource Tab',
];

const PARENT_TABS = ['Overview', 'Attendance', 'Weekly Report', 'Library', 'Search', 'Curate', 'Users', 'Resource Tab'];

export default function App() {
  const { child } = useChild();
  const isParent = isParentProfile(child);
  const isShovanOrBely = child === 'Shovan' || child === 'Bely';
  const tabs = isShovanOrBely ? SHOVAN_BELY_TABS : isParent ? PARENT_TABS : CHILD_TABS;

  // level: canonical level id (e.g. '1', '2', 'C1', 'UG1', 'M1')
  const [level, setLevel] = useState('1');
  // standard: numeric grade for school-only features (Search, Curate, Games)
  const [standard, setStandard] = useState(1);
  const [grade, setGrade] = useState(null);
  const [fullGrade, setFullGrade] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);

  // Rotate child-friendly background every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % BG_IMAGES.length);
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [isParent, isShovanOrBely]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep numeric standard in sync for school-grade-specific features
  useEffect(() => {
    const asNumber = parseInt(level, 10);
    if (!Number.isNaN(asNumber) && String(asNumber) === level) {
      setStandard(asNumber);
    }
  }, [level]);

  // Load overview (subject list) whenever level changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setFullGrade(null);
    setSubjectData(null);
    fetchLevelOverview(level)
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
  }, [level]);

  // Load full subject data on demand when Subjects tab is active
  useEffect(() => {
    if (activeTab !== 'Subjects' || !activeSubject) return undefined;
    let cancelled = false;
    setSubjectLoading(true);
    setSubjectData(null);
    fetchLevelSubject(level, activeSubject)
      .then((payload) => {
        if (!cancelled) setSubjectData(payload.subject || payload);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setSubjectLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, activeSubject, level]);

  // Load full grade data for Library / Games / Fact of the Day
  useEffect(() => {
    if (!['Library', 'Games', 'Fact of the Day'].includes(activeTab) || fullGrade) return undefined;
    let cancelled = false;
    fetchLevel(level)
      .then((data) => { if (!cancelled) setFullGrade(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [activeTab, fullGrade, level]);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url('${BG_IMAGES[bgIndex]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 2s ease-in-out',
      }}
    >
      <Header />
      <UpdatePrompt />
      <main className="mx-auto max-w-[1600px] space-y-6 p-4 lg:px-8 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm">
        <LevelSelector level={level} onChange={(newLevel) => { setLevel(newLevel); setFullGrade(null); }} />
        <Suspense fallback={<LoadingSpinner />}>
          <ProgressDashboard />
        </Suspense>

        <div role="tablist" aria-label="Main sections" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const activeColour = TAB_COLOURS[tab] || 'bg-blue-600 text-white';
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border-0 px-3 py-1 text-sm font-semibold shadow focus:outline focus:outline-2 focus:outline-blue-400 transition-all ${
                  activeTab === tab
                    ? activeColour + ' scale-105 shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {loading && <LoadingSpinner />}
        {error && (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
            <p className="font-semibold">Could not load grade data</p>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-2 text-sm">Make sure the backend is running: <code className="rounded bg-red-100 px-1 dark:bg-red-900">bash start.sh</code></p>
          </div>
        )}

        <ErrorBoundary>
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
              {subjectLoading && <LoadingSpinner />}
              {activeSubject && subjectData && (
                <SubjectLessons
                  key={activeSubject}
                  subjectName={activeSubject}
                  subject={subjectData}
                  standard={level}
                  onChangeGrade={(g) => { setLevel(String(g)); setFullGrade(null); }}
                />
              )}
            </div>
          )}

          {!loading && !error && activeTab === 'Library' && (
            fullGrade ? <ResourceLibrary grade={fullGrade} /> : <LoadingSpinner />
          )}

          {!loading && !error && activeTab === 'Search' && <SearchBar standard={standard} />}

          {activeTab === 'Favourites' && <FavoritesList />}

          {activeTab === 'Colouring' && <ColouringCanvas />}

          {activeTab === 'Code Editor' && <CodeEditor />}

          {activeTab === 'Study Timer' && <StudyTimer />}

          {activeTab === 'Fact of the Day' && (
            fullGrade ? <FactOfTheDay grade={fullGrade} /> : <LoadingSpinner />
          )}

          {activeTab === 'History of the Day' && <HistoryOfTheDay />}

          {activeTab === 'Appearance' && <AppearanceSettings />}

          {activeTab === 'Music' && <SafeMusicPlayer />}

          {activeTab === 'Music & Instruments' && <MusicInstruments />}

          {activeTab === 'Karaoke' && <KaraokeCentre />}

          {activeTab === 'Sing-Along' && <SingAlong />}

          {activeTab === 'Games' && (fullGrade ? <Games grade={fullGrade} /> : <LoadingSpinner />)}

          {activeTab === 'Chess' && <ChessTutor level={level} />}

          {activeTab === 'Study Coach' && <StudyCoach child={child} level={level} />}

          {activeTab === 'Personalized' && <PersonalizedLearningPanel profile={child} levelId={level} subject={activeSubject || ''} />}

          {activeTab === 'PDF Explainer' && <PDFExplainer level={level} child={child} />}

          {activeTab === 'Curate' && <ParentCuration standard={standard} />}

          {activeTab === 'Overview' && <ParentProgressOverview />}
          {activeTab === 'Attendance' && <AttendanceTracker />}
          {activeTab === 'Weekly Report' && <WeeklyReport />}

          {activeTab === 'Resource Tab' && <ResourceTab />}

          {activeTab === 'Users' && <UserManager />}

          {activeTab === 'AI Tutor' && <AiTutor level={level} subjectName={activeSubject || ''} />}

          {activeTab === 'Languages' && <LanguageAcademy />}

          {activeTab === 'Grammar' && <GrammarAcademy />}
          {activeTab === 'Vocabulary' && <VocabularyAcademy />}
          {activeTab === 'STEM Lab' && <StemLab />}
          {activeTab === 'Non-Fiction' && <NonfictionLibrary />}
          {activeTab === 'Practical Skills' && <PracticalSkills />}
          {activeTab === 'Museum' && <VirtualMuseum />}
          {activeTab === 'World Lit' && <WorldLiteratureLibrary />}
          {activeTab === 'Biographies' && <BiographyLibrary />}
          {activeTab === 'Critical Thinking' && <CriticalThinking />}
          {activeTab === 'Survival Skills' && <SurvivalSkills />}
          {activeTab === 'Brain Teasers' && <BrainTeasers />}
          {activeTab === 'Environment' && <EnvironmentalScience />}
          {activeTab === 'World Politics' && <WorldPolitics />}
          {activeTab === 'World Religions' && <WorldReligions />}
          {activeTab === 'Song Centre' && <SongCentre />}
          {activeTab === 'World Cinema' && <MoviesLibrary />}
          {activeTab === 'Math Tools' && <MathTools />}
          {activeTab === 'Health' && <HealthEducation />}
          {activeTab === 'Business' && <BusinessStudies />}
          {activeTab === 'Civics' && <Civics />}
          {activeTab === 'Countries' && <CountriesExplorer />}
          {activeTab === 'Assessment' && <AssessmentCentre />}
          {activeTab === 'Resume' && isShovanOrBely && <ProfessionalWorkspace level={level} />}
        </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
