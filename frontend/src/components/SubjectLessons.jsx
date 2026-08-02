import React, { useEffect, useMemo, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress, postProgress } from '../api/progress.js';
import BookList from './BookList.jsx';
import MediaSection from './MediaSection.jsx';
import InfographicGrid from './InfographicGrid.jsx';
import InfoCardGrid from './InfoCardGrid.jsx';
import LinkResourceList from './LinkResourceList.jsx';
import Exam from './Exam.jsx';
import PracticeQuiz from './PracticeQuiz.jsx';
import MiniCheck from './MiniCheck.jsx';
import PersonalizedLearningPanel from './PersonalizedLearningPanel.jsx';
import { recordLearningEvidence } from '../api/personalized.js';
import CodeEditor from './CodeEditor.jsx';

const MINI_CHECK_STAGE_IDS = ['learn', 'watch', 'explore'];

function displayText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value.title || value.name || value.description || JSON.stringify(value);
}

function referenceUrl(reference) {
  if (typeof reference === 'string') return reference.startsWith('http') ? reference : '';
  return reference?.url || reference?.link || '';
}

function referenceLabel(reference) {
  if (typeof reference === 'string') return reference;
  return [
    reference?.title,
    reference?.publisher,
    reference?.chapter && `Chapter ${reference.chapter}`,
  ].filter(Boolean).join(' — ') || 'Textbook reference';
}

function LessonGraph({ graph }) {
  const points = graph?.points || [];
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const coordinates = points.map((value, index) => {
    const x = 10 + (index * 280) / (points.length - 1);
    const y = 90 - (value * 75) / max;
    return `${x},${y}`;
  }).join(' ');
  return (
    <figure className="rounded-xl border p-4 dark:border-gray-700">
      <figcaption className="mb-2 font-semibold">{graph.title}</figcaption>
      <svg viewBox="0 0 320 120" role="img" aria-label={graph.title} className="h-52 w-full">
        <line x1="10" y1="90" x2="300" y2="90" stroke="currentColor" />
        <line x1="10" y1="10" x2="10" y2="90" stroke="currentColor" />
        <polyline points={coordinates} fill="none" stroke="#2563eb" strokeWidth="4" />
        {coordinates.split(' ').map((point) => {
          const [cx, cy] = point.split(',');
          return <circle key={point} cx={cx} cy={cy} r="4" fill="#2563eb" />;
        })}
        <text x="135" y="112" fontSize="10" fill="currentColor">{graph.x_axis}</text>
        <text x="14" y="9" fontSize="10" fill="currentColor">{graph.y_axis}</text>
      </svg>
    </figure>
  );
}

const LESSON_GROUPS = [
  {
    id: 'curriculum',
    label: 'Curriculum Lessons',
    intro:
      'Work through the complete structured curriculum. Select a lesson to read its explanation, ' +
      'objectives, activities, practice questions, references, and assessment guidance.',
    hasContent: (s) => s.lessons?.length,
  },
  {
    id: 'learn',
    label: 'Learn',
    intro:
      'Start here: read through the books, textbooks, and articles for this topic. ' +
      'Take your time, and feel free to come back and re-read anything that was tricky before moving on.',
    hasContent: (s) =>
      s.books?.length || s.textbooks?.length || s.text_resources?.length,
  },
  {
    id: 'watch',
    label: 'Watch',
    intro:
      'Now watch a video to see the topic explained or brought to life. ' +
      'Watching after reading helps the ideas stick — pause and rewatch any part you want to see again.',
    hasContent: (s) => s.video_resources?.length || s.cartoon_videos?.length,
  },
  {
    id: 'explore',
    label: 'Explore',
    intro:
      'Explore more with info cards, audio, podcasts, comics, infographics, and a drawing activity. ' +
      'These extras add fun facts and creative ways to play with what you just learned and watched.',
    hasContent: (s) =>
      s.info_cards?.length ||
      s.infographics?.length ||
      s.audio_resources?.length ||
      s.podcasts?.length ||
      s.comics?.length ||
      s.drawing_activities?.length,
  },
  {
    id: 'code',
    label: 'Code in Python',
    intro:
      'Try out real Python code! Read the example, then change it and press Run to see what happens. ' +
      "Don't worry about mistakes — every coder learns by experimenting.",
    hasContent: (s, name) => name === 'Coding',
  },
  {
    id: 'courses',
    label: 'More Courses',
    intro:
      'Keep going with real courses from Udemy, Coursera, edX, MIT OpenCourseWare, Harvard Online, ' +
      'and Class Central (which aggregates free courses from every major university), plus Pinterest ' +
      'for visual study notes — all one click away.',
    hasContent: (s) => s.external_courses?.length,
  },
  {
    id: 'practice',
    label: 'Practice',
    intro:
      'Try a few practice questions before the real exam. There is no score here — ' +
      'answer in your head or out loud, then tap "Show answer" to check yourself.',
    hasContent: (s) => s.quiz_bank?.length,
  },
  {
    id: 'exam',
    label: 'Show what you know',
    intro: 'Finish the topic by taking the exam.',
    hasContent: (s) => !!s.exam,
  },
];

function CurriculumLessonBrowser({ lessons, completed, onComplete, recommendedLessonId }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(lessons[0]?.id || '');
  const pageSize = 20;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return lessons;
    return lessons.filter((lesson) =>
      `${lesson.title || ''} ${lesson.unit || ''} ${lesson.key_concepts?.join(' ') || ''}`
        .toLowerCase()
        .includes(needle)
    );
  }, [lessons, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const selected = lessons.find((lesson) => lesson.id === selectedId) || visible[0] || lessons[0];

  useEffect(() => {
    if (recommendedLessonId && lessons.some((lesson) => lesson.id === recommendedLessonId)) {
      setSelectedId(recommendedLessonId);
      const index = filtered.findIndex((lesson) => lesson.id === recommendedLessonId);
      if (index >= 0) setPage(Math.floor(index / pageSize));
    }
  }, [recommendedLessonId, lessons, filtered]);

  function updateQuery(value) {
    setQuery(value);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          {lessons.length} lessons
        </span>
        <input
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search lesson titles, units, or concepts"
          aria-label="Search curriculum lessons"
          className="min-w-64 flex-1 rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.65fr)_minmax(0,3.35fr)]">
        <div>
          <ol className="max-h-[72vh] space-y-1 overflow-y-auto pr-1">
            {visible.map((lesson) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(lesson.id)}
                  className={`w-full rounded border p-2 text-left text-sm ${
                    selected?.id === lesson.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-semibold">{lesson.title}</span>
                  {completed.includes(lesson.id) && <span className="ml-2 text-green-600">✓</span>}
                  {lesson.unit && <span className="mt-0.5 block text-xs text-gray-500">{lesson.unit}</span>}
                </button>
              </li>
            ))}
          </ol>
          {pageCount > 1 && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page + 1} of {pageCount}</span>
              <button
                type="button"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selected && (
          <article className="min-h-[72vh] min-w-0 rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:p-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {selected.unit || 'Curriculum lesson'} · {selected.estimated_time_minutes || 45} minutes
            </p>
            <h4 className="mt-1 text-xl font-bold">{selected.title}</h4>
            {selected.learning_objectives?.length > 0 && (
              <>
                <h5 className="mt-4 font-semibold">Learning objectives</h5>
                <ul className="ml-5 list-disc text-sm">
                  {selected.learning_objectives.map((objective, index) => <li key={index}>{displayText(objective)}</li>)}
                </ul>
              </>
            )}
            {selected.reading_material && (
              <>
                <h5 className="mt-4 font-semibold">Lesson reading</h5>
                <div className="mt-2 max-h-[68vh] min-h-80 overflow-y-auto whitespace-pre-line rounded-xl bg-gray-50 p-5 text-base leading-7 dark:bg-gray-800 lg:p-7">
                  {selected.reading_material}
                </div>
              </>
            )}
            {selected.technical_detail && (
              <section className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950">
                <h5 className="font-semibold">Technical detail</h5>
                <p className="mt-2 leading-7">{selected.technical_detail}</p>
              </section>
            )}
            {selected.formulae?.length > 0 && (
              <section className="mt-5">
                <h5 className="font-semibold">Formulae and reasoning models</h5>
                <div className="mt-2 grid gap-2">
                  {selected.formulae.map((formula, index) => (
                    <code key={index} className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-sm text-white">{displayText(formula)}</code>
                  ))}
                </div>
              </section>
            )}
            {selected.worked_example && (
              <section className="mt-5 rounded-xl border p-5 dark:border-gray-700">
                <h5 className="font-semibold">Worked example</h5>
                <p className="mt-2 font-medium">{displayText(selected.worked_example.problem)}</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {(selected.worked_example.steps || []).map((step, index) => <li key={index}>{displayText(step)}</li>)}
                </ol>
                <p className="mt-3 rounded bg-green-50 p-3 dark:bg-green-950"><strong>Result:</strong> {displayText(selected.worked_example.answer)}</p>
              </section>
            )}
            {selected.data_table?.headers?.length > 0 && (
              <section className="mt-5 overflow-x-auto">
                <h5 className="mb-2 font-semibold">Analysis table</h5>
                <table className="w-full border-collapse text-sm">
                  <thead><tr>{selected.data_table.headers.map((header, index) => <th key={index} className="border bg-gray-100 p-2 text-left dark:bg-gray-800">{displayText(header)}</th>)}</tr></thead>
                  <tbody>{(selected.data_table.rows || []).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border p-2">{displayText(cell)}</td>)}</tr>)}</tbody>
                </table>
              </section>
            )}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {selected.graph && <LessonGraph graph={selected.graph} />}
              {selected.figure?.nodes?.length > 0 && (
                <figure className="rounded-xl border p-4 dark:border-gray-700">
                  <figcaption className="mb-4 font-semibold">{selected.figure.caption}</figcaption>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {selected.figure.nodes.map((node, index) => (
                      <React.Fragment key={`${node}-${index}`}>
                        <span className="rounded-lg bg-blue-100 px-3 py-2 font-medium text-blue-900 dark:bg-blue-900">{node}</span>
                        {index < selected.figure.nodes.length - 1 && <span aria-hidden="true">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </figure>
              )}
            </div>
            {selected.real_world_example && (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 dark:bg-amber-950"><strong>Real-world example:</strong> {selected.real_world_example}</p>
            )}
            {selected.practical_problem && (
              <p className="mt-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950"><strong>Practical problem:</strong> {selected.practical_problem}</p>
            )}
            {selected.video_resources?.length > 0 && (
              <section className="mt-5">
                <h5 className="font-semibold">Video lesson</h5>
                {selected.video_resources.map((video, index) => (
                  <a key={index} href={video.url || video.link} target="_blank" rel="noreferrer" className="mt-2 block rounded-xl border border-red-200 p-4 font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
                    ▶ {video.title || 'Open trusted lesson video'}
                    {video.provider && <span className="ml-2 text-sm">({video.provider})</span>}
                  </a>
                ))}
              </section>
            )}
            {selected.practical_activities?.length > 0 && (
              <>
                <h5 className="mt-4 font-semibold">Activities</h5>
                <ul className="ml-5 list-disc text-sm">
                  {selected.practical_activities.map((activity, index) => <li key={index}>{displayText(activity)}</li>)}
                </ul>
              </>
            )}
            {selected.textbook_references?.length > 0 && (
              <>
                <h5 className="mt-4 font-semibold">References</h5>
                <ul className="space-y-1 text-sm">
                  {selected.textbook_references.map((reference, index) => (
                    <li key={index}>
                      {referenceUrl(reference) ? (
                        <a href={referenceUrl(reference)} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          {referenceLabel(reference)}
                        </a>
                      ) : (
                        <span>{referenceLabel(reference)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              disabled={completed.includes(selected.id)}
              onClick={() => onComplete(selected.id)}
              className="mt-4 rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-green-600"
            >
              {completed.includes(selected.id) ? 'Completed ✓' : 'Mark this lesson complete'}
            </button>
          </article>
        )}
      </div>
    </div>
  );
}

function LessonContent({ groupId, subject, completed, onComplete, levelId, recommendedLessonId }) {
  if (groupId === 'curriculum') {
    return (
      <CurriculumLessonBrowser
        lessons={subject.lessons}
        completed={completed}
        onComplete={onComplete}
        recommendedLessonId={recommendedLessonId}
      />
    );
  }
  if (groupId === 'learn') {
    return (
      <>
        <BookList books={subject.books} />
        <div className="mt-4">
          <LinkResourceList title="Text Resources" items={subject.text_resources} />
        </div>
        <div className="mt-4">
          <LinkResourceList title="Textbooks" items={subject.textbooks} />
        </div>
      </>
    );
  }
  if (groupId === 'watch') {
    return (
      <>
        <MediaSection title="Videos" videos={subject.video_resources} />
        {subject.cartoon_videos?.length > 0 && (
          <div className="mt-4">
            <MediaSection title="Cartoons" videos={subject.cartoon_videos} />
          </div>
        )}
      </>
    );
  }
  if (groupId === 'explore') {
    return (
      <>
        {subject.info_cards?.length > 0 && <InfoCardGrid infoCards={subject.info_cards} />}
        {subject.infographics?.length > 0 && (
          <div className="mt-4">
            <InfographicGrid infographics={subject.infographics} />
          </div>
        )}
        <div className="mt-4">
          <LinkResourceList title="Audio" items={subject.audio_resources} />
        </div>
        <div className="mt-4">
          <LinkResourceList title="Podcasts" items={subject.podcasts} />
        </div>
        <div className="mt-4">
          <LinkResourceList title="Comics" items={subject.comics} />
        </div>
        <div className="mt-4">
          <LinkResourceList title="Drawing Activities" items={subject.drawing_activities} />
        </div>
      </>
    );
  }
  if (groupId === 'courses') {
    return <LinkResourceList title="More Courses & Resources" items={subject.external_courses} />;
  }
  if (groupId === 'code') {
    return <CodeEditor defaultLanguage="python" />;
  }
  if (groupId === 'practice') {
    return (
      <PracticeQuiz
        subjectName={subject.__name}
        questions={subject.quiz_bank}
        levelId={levelId}
        concepts={(subject.lessons || []).flatMap((lesson) => lesson.key_concepts || [])}
      />
    );
  }
  if (groupId === 'exam' && subject.exam) {
    return <Exam subjectName={subject.__name} exam={subject.exam} />;
  }
  return null;
}

function gradeSuggestion(score, standard) {
  if (score == null || !standard) return null;
  if (score < 60 && standard > 1) {
    return { direction: 'easier', targetGrade: standard - 1 };
  }
  if (score >= 90 && standard < 10) {
    return { direction: 'harder', targetGrade: standard + 1 };
  }
  return null;
}

function miniCheckQuestion(lessonId, subject, index) {
  if (!MINI_CHECK_STAGE_IDS.includes(lessonId)) return null;
  const bank = subject.quiz_bank;
  if (!bank?.length) return null;
  return bank[index % bank.length];
}

export default function SubjectLessons({ subjectName, subject, standard, onChangeGrade }) {
  const { child } = useChild();
  const [completed, setCompleted] = useState([]);
  const [subjectScore, setSubjectScore] = useState(null);
  const [recommendedLessonId, setRecommendedLessonId] = useState('');

  useEffect(() => {
    fetchProgress(child)
      .then((p) => {
        setCompleted(p.completed_lessons?.[subjectName] || []);
        setSubjectScore(p.scores?.[subjectName] ?? null);
      })
      .catch(() => {
        setCompleted([]);
        setSubjectScore(null);
      });
  }, [child, subjectName]);

  const suggestion = gradeSuggestion(subjectScore, standard);

  const lessons = LESSON_GROUPS.filter((g) => g.hasContent(subject, subjectName));

  async function markComplete(lessonId) {
    await postProgress(child, { completed_lessons: { [subjectName]: [lessonId] } });
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  }

  return (
    <section className="rounded border p-4 dark:border-gray-700" aria-label={subjectName}>
      <h2 className="mb-3 text-lg font-bold">{subjectName}</h2>
      <PersonalizedLearningPanel
        profile={child}
        levelId={standard}
        subject={subjectName}
        onSelectLesson={setRecommendedLessonId}
      />
      {suggestion && onChangeGrade && (
        <p className="mb-3 rounded border border-blue-400 bg-blue-50 p-2 text-sm dark:bg-blue-950">
          {suggestion.direction === 'easier'
            ? `Your last ${subjectName} exam score was a bit low — want to try `
            : `Great job on your last ${subjectName} exam — ready for `}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => onChangeGrade(suggestion.targetGrade)}
          >
            Grade {suggestion.targetGrade} {subjectName}
          </button>
          {suggestion.direction === 'easier' ? ' as an easier review?' : ' a bigger challenge?'}
        </p>
      )}
      <ol className="space-y-4">
        {lessons.map((lesson, index) => {
          const isDone = completed.includes(lesson.id);
          return (
            <li key={lesson.id} className="rounded border p-3 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Lesson {index + 1}: {lesson.label}
                </h3>
                {isDone && <span className="text-sm text-green-600">Completed ✓</span>}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{lesson.intro}</p>
              <div className="mt-3">
                <LessonContent
                  groupId={lesson.id}
                  subject={{ ...subject, __name: subjectName }}
                  completed={completed}
                  onComplete={markComplete}
                  levelId={standard}
                  recommendedLessonId={recommendedLessonId}
                />
              </div>
              {lesson.id !== 'curriculum' && !isDone && miniCheckQuestion(lesson.id, subject, index) ? (
                <MiniCheck
                  question={miniCheckQuestion(lesson.id, subject, index)}
                  onPassed={() => markComplete(lesson.id)}
                  onAnswered={({ correct, answer, expectedAnswer }) => {
                    const concepts = (subject.lessons || []).flatMap((item) => item.key_concepts || []);
                    recordLearningEvidence(child, {
                      level_id: String(standard),
                      subject: subjectName,
                      concept: concepts[index % Math.max(concepts.length, 1)] || subjectName,
                      correct,
                      lesson_id: lesson.id,
                      question_id: miniCheckQuestion(lesson.id, subject, index)?.question || lesson.id,
                      answer: String(answer),
                      expected_answer: String(expectedAnswer),
                    }).catch(() => {});
                  }}
                />
              ) : (
                lesson.id !== 'curriculum' && !isDone && (
                  <button
                    type="button"
                    onClick={() => markComplete(lesson.id)}
                    className="mt-3 rounded border px-3 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
                  >
                    Mark lesson complete
                  </button>
                )
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
