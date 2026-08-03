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
const SportsCentre = lazy(() => import('./components/SportsCentre.jsx'));
const PlayerBiographies = lazy(() => import('./components/PlayerBiographies.jsx'));
const SportsTournaments = lazy(() => import('./components/SportsTournaments.jsx'));
const ArkAIAssistant = lazy(() => import('./components/ArkAIAssistant.jsx'));

// 48 rotating backgrounds: nature (16), space (16), famous art (16) — rotates every 15 min
const BG_IMAGES = [
  // ── NATURE ──────────────────────────────────────────────────────────────────
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80', // lush green forest
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', // ocean waves
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', // snowy mountains
  'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80', // butterflies
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80', // golden wheat field
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80', // sunrise over hills
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80', // coral reef underwater
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', // misty forest path
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80', // autumn leaves
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80', // tropical waterfall
  'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=1920&q=80', // cherry blossom
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', // sunflower field
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80', // wildflower meadow
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80', // flamingos pink lake
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=80', // hot air balloons
  'https://images.unsplash.com/photo-1439853949212-36589f9f5f86?w=1920&q=80', // icebergs arctic
  // ── SPACE ───────────────────────────────────────────────────────────────────
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', // starry night sky
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1920&q=80', // colourful galaxy
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80', // milky way
  'https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=1920&q=80', // earth from space
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', // nebula purple/pink
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80', // planet from orbit
  'https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=1920&q=80', // moon surface
  'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=1920&q=80', // saturn rings
  'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=1920&q=80', // meteor shower
  'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1920&q=80', // deep space blue
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&q=80', // aurora from above
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1920&q=80', // northern lights green
  'https://images.unsplash.com/photo-1501862700950-18382cd41497?w=1920&q=80', // galaxy swirl
  'https://images.unsplash.com/photo-1537420327992-d6e192287183?w=1920&q=80', // starfield blue
  'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&q=80', // space orange nebula
  'https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=1920&q=80', // solar eclipse
  // ── FAMOUS ART (public domain masterpieces) ─────────────────────────────────
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1920px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', // Starry Night – Van Gogh
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1920px-Tsunami_by_hokusai_19th_century.jpg', // The Great Wave – Hokusai
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1920px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg', // Water Lilies – Monet
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Johannes_Vermeer_-_Girl_with_a_Pearl_Earring.jpg/956px-Johannes_Vermeer_-_Girl_with_a_Pearl_Earring.jpg', // Girl with a Pearl Earring – Vermeer
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/1022px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg', // Van Gogh Self Portrait
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1920px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg', // Impression Sunrise – Monet
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Felis_silvestris_catus_lying_on_rice_straw.jpg/1920px-Felis_silvestris_catus_lying_on_rice_straw.jpg', // Hiroshige ukiyo-e style
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', // Mona Lisa – da Vinci
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/1920px-Gatto_europeo4.jpg', // placeholder – replace with art
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vincent_Willem_van_Gogh_128.jpg/1920px-Vincent_Willem_van_Gogh_128.jpg', // Bedroom in Arles – Van Gogh
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884-86.jpg/1920px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884-86.jpg', // Sunday on La Grande Jatte – Seurat
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Renoir14.jpg/1920px-Renoir14.jpg', // Dance at Le Moulin – Renoir
  'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=1920&q=80', // museum art gallery hall
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&q=80', // colourful abstract paint
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80', // watercolour painting
  'https://images.unsplash.com/photo-1578301978069-0f7f6c4f6b71?w=1920&q=80', // art studio colourful
];

const TAB_COLOURS = {
  // 🔵 Learning / Academic — royal blues & indigos
  'Subjects':          'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
  'Library':           'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
  'AI Tutor':          'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
  'Ark AI':            'bg-gradient-to-r from-purple-700 to-indigo-700 text-white',
  'Languages':         'bg-gradient-to-r from-violet-600 to-purple-700 text-white',
  'Grammar':           'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
  'Vocabulary':        'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white',
  'Personalized':      'bg-gradient-to-r from-indigo-500 to-blue-600 text-white',
  'Study Coach':       'bg-gradient-to-r from-blue-700 to-indigo-700 text-white',
  'Assessment':        'bg-gradient-to-r from-blue-800 to-blue-900 text-white',
  // 🟢 Science / STEM — vivid greens & teals
  'STEM Lab':          'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
  'Math Tools':        'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  'Environment':       'bg-gradient-to-r from-teal-500 to-green-600 text-white',
  'Critical Thinking': 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white',
  'Brain Teasers':     'bg-gradient-to-r from-lime-600 to-green-700 text-white',
  // 🟡 Culture / World — warm ambers, golds & oranges
  'Museum':            'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
  'World Lit':         'bg-gradient-to-r from-yellow-500 to-amber-600 text-white',
  'Biographies':       'bg-gradient-to-r from-amber-600 to-yellow-700 text-white',
  'Countries':         'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
  'World Politics':    'bg-gradient-to-r from-orange-600 to-red-600 text-white',
  'World Religions':   'bg-gradient-to-r from-amber-700 to-orange-700 text-white',
  'Non-Fiction':       'bg-gradient-to-r from-yellow-600 to-amber-700 text-white',
  'World Cinema':      'bg-gradient-to-r from-red-600 to-rose-700 text-white',
  // 🟢 Sports — bold greens & golds
  'Sports':            'bg-gradient-to-r from-green-700 to-emerald-800 text-white',
  'Tournaments':       'bg-gradient-to-r from-amber-600 to-yellow-700 text-white',
  'Players':           'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
  // 🔴 Health / Life — roses & pinks
  'Health':            'bg-gradient-to-r from-rose-500 to-pink-600 text-white',
  'Practical Skills':  'bg-gradient-to-r from-rose-600 to-red-700 text-white',
  'Survival Skills':   'bg-gradient-to-r from-red-700 to-rose-800 text-white',
  'Business':          'bg-gradient-to-r from-pink-600 to-fuchsia-700 text-white',
  'Civics':            'bg-gradient-to-r from-pink-500 to-rose-600 text-white',
  // 🎨 Creative / Fun — vivid fuchsia, lime, cyan
  'Colouring':         'bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white',
  'Code Editor':       'bg-gradient-to-r from-cyan-700 to-blue-800 text-white',
  'Games':             'bg-gradient-to-r from-lime-500 to-green-600 text-white',
  'Chess':             'bg-gradient-to-r from-lime-700 to-emerald-800 text-white',
  // 🎵 Music — sky blues & cyans
  'Music':             'bg-gradient-to-r from-sky-400 to-blue-500 text-white',
  'Music & Instruments':'bg-gradient-to-r from-sky-500 to-cyan-600 text-white',
  'Song Centre':       'bg-gradient-to-r from-cyan-500 to-sky-600 text-white',
  'Sing-Along':        'bg-gradient-to-r from-cyan-400 to-teal-500 text-white',
  'Karaoke':           'bg-gradient-to-r from-sky-600 to-indigo-600 text-white',
  // 🔧 Utilities — slates & neutrals with colour pops
  'Search':            'bg-gradient-to-r from-slate-500 to-gray-600 text-white',
  'Favourites':        'bg-gradient-to-r from-red-500 to-rose-600 text-white',
  'PDF Explainer':     'bg-gradient-to-r from-slate-600 to-zinc-700 text-white',
  'Study Timer':       'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
  'Fact of the Day':   'bg-gradient-to-r from-yellow-600 to-amber-700 text-white',
  'History of the Day':'bg-gradient-to-r from-stone-600 to-amber-800 text-white',
  'Appearance':        'bg-gradient-to-r from-gray-600 to-slate-700 text-white',
  'Resource Tab':      'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
  // 👩‍👧 Parent — deep navies & purples
  'Overview':          'bg-gradient-to-r from-blue-900 to-indigo-900 text-white',
  'Attendance':        'bg-gradient-to-r from-blue-800 to-blue-900 text-white',
  'Weekly Report':     'bg-gradient-to-r from-indigo-800 to-purple-900 text-white',
  'Curate':            'bg-gradient-to-r from-purple-700 to-violet-800 text-white',
  'Users':             'bg-gradient-to-r from-violet-800 to-purple-900 text-white',
  'Resume':            'bg-gradient-to-r from-teal-700 to-emerald-800 text-white',
};

const CHILD_TABS = [
  'Subjects',
  'Library',
  'Search',
  'Favourites',
  'AI Tutor',
  'Ark AI',
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
  'Sports',
  'Tournaments',
  'Players',
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
          {activeTab === 'Ark AI' && <ArkAIAssistant level={level} subject={activeSubject || ''} child={child} fullPage />}

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
          {activeTab === 'Sports' && <SportsCentre />}
          {activeTab === 'Tournaments' && <SportsTournaments />}
          {activeTab === 'Players' && <PlayerBiographies />}
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

      {/* Floating Ark AI assistant — always available on every page */}
      {activeTab !== 'Ark AI' && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <ArkAIAssistant level={level} subject={activeSubject || ''} child={child} activeTab={activeTab} />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
