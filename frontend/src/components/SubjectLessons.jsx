import React, { useEffect, useState } from 'react';
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
import CodeEditor from './CodeEditor.jsx';

const MINI_CHECK_STAGE_IDS = ['learn', 'watch', 'explore'];

const LESSON_GROUPS = [
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

function LessonContent({ groupId, subject }) {
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
  if (groupId === 'code') {
    return <CodeEditor defaultLanguage="python" />;
  }
  if (groupId === 'practice') {
    return <PracticeQuiz subjectName={subject.__name} questions={subject.quiz_bank} />;
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
          const isUnlocked = index === 0 || completed.includes(lessons[index - 1].id);
          return (
            <li key={lesson.id} className="rounded border p-3 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Lesson {index + 1}: {lesson.label}
                </h3>
                {isDone && <span className="text-sm text-green-600">Completed ✓</span>}
              </div>
              {!isUnlocked && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Complete "{lessons[index - 1].label}" first to unlock this lesson.
                </p>
              )}
              {isUnlocked && (
                <>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{lesson.intro}</p>
                  <div className="mt-3">
                    <LessonContent groupId={lesson.id} subject={{ ...subject, __name: subjectName }} />
                  </div>
                  {!isDone && miniCheckQuestion(lesson.id, subject, index) ? (
                    <MiniCheck
                      question={miniCheckQuestion(lesson.id, subject, index)}
                      onPassed={() => markComplete(lesson.id)}
                    />
                  ) : (
                    !isDone && (
                      <button
                        type="button"
                        onClick={() => markComplete(lesson.id)}
                        className="mt-3 rounded border px-3 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
                      >
                        Mark lesson complete
                      </button>
                    )
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
