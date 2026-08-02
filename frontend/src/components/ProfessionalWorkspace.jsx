import { useEffect, useState } from 'react';
import LessonPlanner from './LessonPlanner.jsx';
import {
  createAssessment,
  createCpd,
  createOrganization,
  createPortfolioItem,
  createResearchProject,
  draftResume,
  ensureProfessionalUser,
  getLtiConfig,
  getProfessionalDashboard,
  listAssessments,
  listCareerPathways,
  listCpd,
  listOrganizations,
  listPortfolio,
  listProfessionalCourses,
  listResearchProjects,
  saveResearchNote,
  searchResearch,
} from '../api/professional.js';
import { downloadFile } from '../utils/download.js';

const SECTIONS = ['Dashboard', 'Research', 'Lesson Planner', 'Assessments', 'Career', 'Institutions', 'Integrations'];

export default function ProfessionalWorkspace({ level = '1' }) {
  const [section, setSection] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState({});
  const [projects, setProjects] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [cpd, setCpd] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lti, setLti] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [researchQuery, setResearchQuery] = useState('');
  const [note, setNote] = useState({ title: '', markdown: '' });
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentKind, setAssessmentKind] = useState('diagnostic');
  const [assessmentTimed, setAssessmentTimed] = useState(false);
  const [rubricCriteria, setRubricCriteria] = useState('Knowledge, Analysis, Evidence, Communication');
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', skills: '' });
  const [cpdForm, setCpdForm] = useState({ title: '', provider: '', hours: '' });
  const [organizationName, setOrganizationName] = useState('');
  const [organizationKind, setOrganizationKind] = useState('university');
  const [careerTarget, setCareerTarget] = useState('');
  const [interviewPrompt, setInterviewPrompt] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeContact, setResumeContact] = useState('');
  const [resumeJobDescription, setResumeJobDescription] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [resumeExperience, setResumeExperience] = useState('');
  const [resumeEducation, setResumeEducation] = useState('');
  const [resumeDraft, setResumeDraft] = useState(null);
  const [resumeDrafting, setResumeDrafting] = useState(false);
  const [resumeExporting, setResumeExporting] = useState('');
  const [resumeError, setResumeError] = useState('');

  async function handleDraftResume() {
    setResumeError('');
    setResumeDrafting(true);
    try {
      const skills = resumeSkills.split(',').map((item) => item.trim()).filter(Boolean);
      const experience = resumeExperience.split('\n').map((item) => item.trim()).filter(Boolean);
      const draft = await draftResume({
        name: resumeName,
        target_role: careerTarget,
        job_description: resumeJobDescription,
        skills,
        experience,
        education: resumeEducation,
      });
      setResumeDraft(draft);
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setResumeDrafting(false);
    }
  }

  async function handleExportResume(format) {
    if (!resumeDraft) return;
    setResumeError('');
    setResumeExporting(format);
    try {
      await downloadFile(
        '/api/pro/resume/export',
        `${resumeName || 'resume'}.${format}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: resumeName,
            target_role: careerTarget,
            contact: resumeContact,
            education: resumeEducation,
            summary: resumeDraft.summary,
            skills: resumeDraft.skills,
            experience: resumeDraft.experience,
            format,
          }),
        }
      );
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setResumeExporting('');
    }
  }
  const [connections, setConnections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduai_integrations')) || {}; }
    catch { return {}; }
  });

  function toggleConnection(id) {
    const next = { ...connections, [id]: !connections[id] };
    setConnections(next);
    localStorage.setItem('eduai_integrations', JSON.stringify(next));
  }

  async function refresh(activeUser) {
    const [dash, research, assessmentRows, portfolioRows, cpdRows, career, orgRows, courseRows, ltiConfig] =
      await Promise.all([
        getProfessionalDashboard(activeUser.id),
        listResearchProjects(activeUser.id),
        listAssessments(),
        listPortfolio(activeUser.id),
        listCpd(activeUser.id),
        listCareerPathways(),
        listOrganizations(),
        listProfessionalCourses(),
        getLtiConfig(),
      ]);
    setDashboard(dash);
    setProjects(research);
    setAssessments(assessmentRows);
    setPortfolio(portfolioRows);
    setCpd(cpdRows);
    setPathways(career.pathways);
    setOrganizations(orgRows);
    setCourses(courseRows);
    setLti(ltiConfig);
  }

  useEffect(() => {
    ensureProfessionalUser({ email: 'shovan@legacy.local', display_name: 'Shovan', role: 'admin' })
      .then(async (activeUser) => {
        setUser(activeUser);
        await refresh(activeUser);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  }, []);

  async function run(action) {
    setError('');
    setBusy(true);
    try {
      await action();
      await refresh(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const metricCards = [
    ['Research projects', dashboard.research_projects || 0],
    ['Knowledge notes', dashboard.notes || 0],
    ['Assessment attempts', dashboard.assessment_attempts || 0],
    ['Portfolio projects', dashboard.portfolio_items || 0],
    ['CPD hours', Number(dashboard.cpd_hours || 0).toFixed(1)],
  ];

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">Adult learning workspace</p>
        <h2 className="mt-2 text-3xl font-bold">EduAI_Pro Command Centre</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          Research, assessment, career development and institutional learning from Level 1 through M2.
          Current level: <strong>{level}</strong>
        </p>
      </header>

      <div className="grid min-h-[38rem] md:grid-cols-[13rem_1fr]">
        <nav aria-label="Professional workspace" className="border-r bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-950">
          {SECTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                section === item
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="p-5">
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {busy && <p className="mb-3 text-sm text-gray-500">Updating workspace…</p>}

          {section === 'Dashboard' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Welcome, {user?.display_name || 'learner'}</h3>
                <p className="text-sm text-gray-500">Your learning, research and professional evidence in one place.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {metricCards.map(([label, value]) => (
                  <div key={label} className="rounded-xl border p-4 dark:border-gray-700">
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{value}</div>
                    <div className="mt-1 text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Continue learning">
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="border-b py-2 text-sm last:border-0 dark:border-gray-700">
                      <strong>{course.title}</strong>
                      <span className="ml-2 text-xs text-gray-500">{course.level_id}</span>
                    </div>
                  ))}
                  {courses.length === 0 && <Empty>Run the JSON migration to populate database courses.</Empty>}
                </Panel>
                <Panel title="Recommended next actions">
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    <li>Create a research project and index your owned textbooks.</li>
                    <li>Record a portfolio project and its demonstrated skills.</li>
                    <li>Add CPD evidence for completed professional learning.</li>
                    <li>Create a diagnostic assessment or capstone rubric.</li>
                  </ul>
                </Panel>
              </div>
            </div>
          )}

          {section === 'Research' && (
            <div className="space-y-5">
              <Heading title="Research & Knowledge" subtitle="Projects, semantic retrieval, notebooks and citations." />
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!projectTitle.trim()) return;
                  run(async () => {
                    await createResearchProject({ owner_id: user.id, title: projectTitle });
                    setProjectTitle('');
                  });
                }}
              >
                <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="New research project" className="input flex-1" />
                <button className="button">Create</button>
              </form>
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-xl border p-4 dark:border-gray-700">
                    <strong>{project.title}</strong>
                    <p className="mt-1 text-sm text-gray-500">{project.description || 'Research workspace'}</p>
                    <div className="mt-3 flex gap-3 text-xs">
                      <a className="text-blue-600 underline" href={`/api/pro/research/projects/${project.id}/bibliography?format=markdown`}>Markdown bibliography</a>
                      <a className="text-blue-600 underline" href={`/api/pro/research/projects/${project.id}/bibliography?format=bibtex`}>BibTeX</a>
                    </div>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setResults(await searchResearch(researchQuery, projects[0]?.id || ''));
                }}
              >
                <input value={researchQuery} onChange={(e) => setResearchQuery(e.target.value)} placeholder="Search indexed knowledge" className="input flex-1" />
                <button className="button">Search</button>
              </form>
              {results.map((result) => (
                <div key={result.id} className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-gray-800">
                  <strong>{result.title}</strong>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{result.excerpt}</p>
                </div>
              ))}
              <Panel title="Research notebook">
                <div className="space-y-2">
                  <input value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="Note title" className="input w-full" />
                  <textarea value={note.markdown} onChange={(e) => setNote({ ...note, markdown: e.target.value })} placeholder="Write in Markdown…" rows={5} className="input w-full" />
                  <button
                    className="button"
                    onClick={() => run(async () => {
                      await saveResearchNote({ user_id: user.id, project_id: projects[0]?.id, ...note });
                      setNote({ title: '', markdown: '' });
                    })}
                  >
                    Save note
                  </button>
                </div>
              </Panel>
            </div>
          )}

          {section === 'Lesson Planner' && user && <LessonPlanner ownerId={user.id} level={level} />}

          {section === 'Assessments' && (
            <div className="space-y-5">
              <Heading title="Assessment Studio" subtitle="Design diagnostics, examinations, essays, presentations and capstones with auditable rubrics." />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Diagnostic', 'Establish starting level and knowledge gaps.'],
                  ['Secure exam', 'Timed attempts, randomisation and retake rules.'],
                  ['Essay/report', 'Evidence, argument and citation-based grading.'],
                  ['Capstone', 'Multi-stage project with presentation and review.'],
                ].map(([title, text]) => <Panel key={title} title={title}><p className="text-sm">{text}</p></Panel>)}
              </div>
              <form
                className="grid gap-3 rounded-xl border p-4 dark:border-gray-700 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!assessmentTitle.trim()) return;
                  run(async () => {
                    await createAssessment({
                      owner_id: user.id,
                      title: assessmentTitle,
                      kind: assessmentKind,
                      settings: { timed: assessmentTimed, retakes: true, randomise: true, instructor_review: true },
                      rubric: { criteria: rubricCriteria.split(',').map((item) => item.trim()).filter(Boolean) },
                    });
                    setAssessmentTitle('');
                  });
                }}
              >
                <input value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} placeholder="Assessment or capstone title" className="input flex-1" />
                <select value={assessmentKind} onChange={(e) => setAssessmentKind(e.target.value)} className="input">
                  <option value="diagnostic">Diagnostic placement</option>
                  <option value="quiz">Quiz / examination</option>
                  <option value="essay">Essay / report</option>
                  <option value="presentation">Oral / presentation</option>
                  <option value="capstone">Capstone project</option>
                </select>
                <input value={rubricCriteria} onChange={(e) => setRubricCriteria(e.target.value)} className="input md:col-span-2" aria-label="Rubric criteria" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={assessmentTimed} onChange={(e) => setAssessmentTimed(e.target.checked)} /> Timed assessment</label>
                <button className="button">Create assessment</button>
              </form>
              <div className="grid gap-3 md:grid-cols-2">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="rounded-xl border p-4 dark:border-gray-700">
                    <span className="text-xs uppercase text-indigo-600">{assessment.kind}</span>
                    <h4 className="font-semibold">{assessment.title}</h4>
                    <p className="mt-2 text-xs text-gray-500">
                      {assessment.settings?.timed ? 'Timed' : 'Untimed'} ·
                      {assessment.settings?.retakes ? ' Retakes enabled' : ' Single attempt'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'Career' && (
            <div className="space-y-5">
              <Heading title="Career Lab" subtitle="Plan a role transition, build evidence, practise interviews and maintain CPD." />
              <Panel title="Target-role planner">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={careerTarget} onChange={(e) => setCareerTarget(e.target.value)} className="input flex-1" placeholder="Target role, e.g. Data Analyst" />
                  <button type="button" className="button" onClick={() => setInterviewPrompt(careerTarget ? `Tell me about a project that proves you can succeed as a ${careerTarget}.` : 'Describe a difficult professional problem and how you solved it.')}>Generate interview prompt</button>
                </div>
                {interviewPrompt && <p className="mt-3 rounded-lg bg-indigo-50 p-3 text-sm dark:bg-indigo-950"><strong>Interview simulation:</strong> {interviewPrompt}</p>}
              </Panel>
              <div className="grid gap-3 md:grid-cols-2">
                {pathways.map((pathway) => (
                  <div key={pathway.id} className="rounded-xl border p-4 dark:border-gray-700">
                    <h4 className="font-semibold">{pathway.title}</h4>
                    <p className="mt-2 text-sm text-gray-500">{pathway.skills.join(' · ')}</p>
                    <p className="mt-2 text-xs">Suggested evidence: {pathway.projects.join(', ')}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Add portfolio evidence">
                  <div className="space-y-2">
                    <input value={portfolioForm.title} onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })} placeholder="Project title" className="input w-full" />
                    <textarea value={portfolioForm.description} onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })} placeholder="Outcome and evidence" className="input w-full" />
                    <input value={portfolioForm.skills} onChange={(e) => setPortfolioForm({ ...portfolioForm, skills: e.target.value })} placeholder="Skills, comma separated" className="input w-full" />
                    <button className="button" onClick={() => run(async () => {
                      await createPortfolioItem({ owner_id: user.id, ...portfolioForm, skills: portfolioForm.skills.split(',').map((item) => item.trim()).filter(Boolean) });
                      setPortfolioForm({ title: '', description: '', skills: '' });
                    })}>Save portfolio item</button>
                  </div>
                </Panel>
                <Panel title="Record CPD">
                  <div className="space-y-2">
                    <input value={cpdForm.title} onChange={(e) => setCpdForm({ ...cpdForm, title: e.target.value })} placeholder="Course or activity" className="input w-full" />
                    <input value={cpdForm.provider} onChange={(e) => setCpdForm({ ...cpdForm, provider: e.target.value })} placeholder="Provider" className="input w-full" />
                    <input type="number" min="0" step="0.5" value={cpdForm.hours} onChange={(e) => setCpdForm({ ...cpdForm, hours: e.target.value })} placeholder="Hours" className="input w-full" />
                    <button className="button" onClick={() => run(async () => {
                      await createCpd({ owner_id: user.id, ...cpdForm });
                      setCpdForm({ title: '', provider: '', hours: '' });
                    })}>Save CPD</button>
                  </div>
                </Panel>
              </div>
              <Panel title="Current evidence">
                <p className="text-sm">{portfolio.length} portfolio items · {cpd.length} CPD records</p>
              </Panel>
              <div className="grid gap-3 md:grid-cols-2">
                <Panel title="Technical interviews"><p className="text-sm">Practise coding, data, case-study and system-design exercises.</p></Panel>
                <Panel title="Certification map"><p className="text-sm">Connect course mastery and CPD hours to professional certification evidence.</p></Panel>
              </div>

              <Panel title="Resume Builder">
                <p className="mb-3 text-sm text-gray-500">
                  Turn your skills and portfolio notes into a polished, job-aware resume. EduBot rewrites
                  your raw notes into quantified achievement statements without inventing facts, and you can
                  download the result as a PDF or Word document.
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input value={resumeName} onChange={(e) => setResumeName(e.target.value)} placeholder="Full name" className="input w-full" />
                  <input value={resumeContact} onChange={(e) => setResumeContact(e.target.value)} placeholder="Contact (email, phone, location)" className="input w-full" />
                </div>
                <textarea
                  value={resumeJobDescription}
                  onChange={(e) => setResumeJobDescription(e.target.value)}
                  placeholder="Paste the target job description (optional) so the resume can be tailored to it"
                  rows={3}
                  className="input mt-2 w-full"
                />
                <textarea
                  value={resumeSkills}
                  onChange={(e) => setResumeSkills(e.target.value)}
                  placeholder="Skills, comma separated"
                  rows={2}
                  className="input mt-2 w-full"
                />
                <textarea
                  value={resumeExperience}
                  onChange={(e) => setResumeExperience(e.target.value)}
                  placeholder="Experience or portfolio notes, one per line"
                  rows={4}
                  className="input mt-2 w-full"
                />
                <input value={resumeEducation} onChange={(e) => setResumeEducation(e.target.value)} placeholder="Education" className="input mt-2 w-full" />
                <button
                  type="button"
                  className="button mt-3"
                  disabled={resumeDrafting || (!resumeSkills.trim() && !resumeExperience.trim())}
                  onClick={handleDraftResume}
                >
                  {resumeDrafting ? 'Drafting…' : 'Draft resume'}
                </button>
                {resumeError && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{resumeError}</p>}
                {resumeDraft && (
                  <div className="mt-4 rounded-lg border bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                    <h5 className="font-semibold">Summary</h5>
                    <p className="mt-1 whitespace-pre-wrap">{resumeDraft.summary}</p>
                    {resumeDraft.skills?.length > 0 && (
                      <>
                        <h5 className="mt-3 font-semibold">Skills</h5>
                        <p className="mt-1">{resumeDraft.skills.join(', ')}</p>
                      </>
                    )}
                    {resumeDraft.experience?.length > 0 && (
                      <>
                        <h5 className="mt-3 font-semibold">Experience</h5>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                          {resumeDraft.experience.map((bullet, index) => (
                            <li key={index}>{bullet}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button type="button" className="button" disabled={resumeExporting === 'pdf'} onClick={() => handleExportResume('pdf')}>
                        {resumeExporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
                      </button>
                      <button type="button" className="button" disabled={resumeExporting === 'docx'} onClick={() => handleExportResume('docx')}>
                        {resumeExporting === 'docx' ? 'Exporting…' : 'Download Word'}
                      </button>
                    </div>
                  </div>
                )}
              </Panel>
            </div>
          )}

          {section === 'Institutions' && (
            <div className="space-y-5">
              <Heading title="Institution Operations" subtitle="Manage organisations, cohorts, instructors, delivery, engagement and quality assurance." />
              <form
                className="grid gap-2 sm:grid-cols-[1fr_12rem_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!organizationName.trim()) return;
                  run(async () => {
                    await createOrganization({ owner_id: user.id, name: organizationName, kind: organizationKind });
                    setOrganizationName('');
                  });
                }}
              >
                <input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Organisation, university or company" className="input flex-1" />
                <select value={organizationKind} onChange={(e) => setOrganizationKind(e.target.value)} className="input">
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="company">Company</option>
                  <option value="training_provider">Training provider</option>
                </select>
                <button className="button">Create</button>
              </form>
              <div className="grid gap-3 sm:grid-cols-2">
                {organizations.map((organization) => (
                  <div key={organization.id} className="rounded-xl border p-4 dark:border-gray-700">
                    <strong>{organization.name}</strong>
                    <p className="text-xs uppercase text-gray-500">{organization.kind}</p>
                  </div>
                ))}
              </div>
              <Panel title="Institution roadmap">
                <p className="mb-2 text-xs text-gray-500">
                  Organisations above are fully working. These have a database and API in place but no
                  dashboard here yet, so they aren&apos;t usable from this screen:
                </p>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  {['Cohorts and classrooms', 'Assignments and announcements', 'Discussion forums', 'Attendance records'].map((item) => (
                    <div key={item} className="rounded bg-amber-50 px-3 py-2 dark:bg-amber-950">🚧 {item} — backend ready, no UI yet</div>
                  ))}
                  {['Instructor accounts', 'Group projects', 'Peer review', 'Course authoring'].map((item) => (
                    <div key={item} className="rounded bg-slate-50 px-3 py-2 dark:bg-gray-800">☐ {item} — not built</div>
                  ))}
                </div>
              </Panel>
              <div className="grid gap-3 md:grid-cols-3">
                <Panel title="Organisations"><p className="text-2xl font-bold">{organizations.length}</p><p className="text-sm">organisations created</p></Panel>
              </div>
            </div>
          )}

          {section === 'Integrations' && (
            <div className="space-y-5">
              <Heading title="Integration Hub" subtitle="Connect learning platforms and exchange standards from one controlled workspace." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Panel title="SCORM 1.2">
                  <p className="text-sm text-gray-500">Export a database course as an interoperable package.</p>
                  {courses[0] && <a href={`/api/pro/lms/scorm/${courses[0].id}`} className="mt-3 inline-block text-sm text-blue-600 underline">Download sample course</a>}
                </Panel>
                <Panel title="xAPI">
                  <p className="text-sm text-gray-500">Generate learning statements ready for an external Learning Record Store.</p>
                </Panel>
                <Panel title="LTI 1.3">
                  <p className="text-sm text-gray-500">{lti?.status || 'Loading configuration…'}</p>
                </Panel>
                {[
                  ['moodle', 'Moodle', 'Course, grade and enrolment synchronisation'],
                  ['canvas', 'Canvas', 'Assignments, outcomes and roster exchange'],
                  ['teams', 'Microsoft Teams', 'Classes, meetings and announcements'],
                ].map(([id, title, description]) => (
                  <Panel key={id} title={title}>
                    <p className="text-sm">{description}</p>
                    <button type="button" onClick={() => toggleConnection(id)} className={`mt-3 rounded px-3 py-1.5 text-sm font-semibold ${connections[id] ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-gray-700'}`}>
                      {connections[id] ? 'Marked as planned ✓' : 'Plan this integration'}
                    </button>
                  </Panel>
                ))}
              </div>
              <Panel title="Supported destinations">
                <p className="text-sm">Moodle · Canvas · Microsoft Teams · SCORM 1.2/2004 · xAPI · LTI 1.3</p>
                <p className="mt-2 text-xs">Connection choices are stored locally; production OAuth credentials remain server-side and are never written into the browser.</p>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Heading({ title, subtitle }) {
  return <div><h3 className="text-2xl font-bold">{title}</h3><p className="text-sm text-gray-500">{subtitle}</p></div>;
}

function Panel({ title, children }) {
  return <div className="rounded-xl border p-4 dark:border-gray-700"><h4 className="mb-3 font-semibold">{title}</h4>{children}</div>;
}

function Empty({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
