import React, { useEffect, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';
import { fetchProgress, postProgress } from '../api/progress.js';
import BookList from './BookList.jsx';
import MediaSection from './MediaSection.jsx';
import InfographicGrid from './InfographicGrid.jsx';
import InfoCardGrid from './InfoCardGrid.jsx';
import LinkResourceList from './LinkResourceList.jsx';
import Exam from './Exam.jsx';

const LESSON_GROUPS = [
  {
    id: 'learn',
    label: 'Learn',
    intro: 'Start here: read through the books, textbooks, and articles for this topic.',
    hasContent: (s) =>
      s.books?.length || s.textbooks?.length || s.text_resources?.length,
  },
  {
    id: 'watch',
    label: 'Watch',
    intro: 'Now watch a video to see the topic explained or brought to life.',
    hasContent: (s) => s.video_resources?.length || s.cartoon_videos?.length,
  },
  {
    id: 'explore',
    label: 'Explore',
    intro: 'Explore more with info cards, audio, comics, infographics, and a drawing activity.',
    hasContent: (s) =>
      s.info_cards?.length ||
      s.infographics?.length ||
      s.audio_resources?.length ||
      s.comics?.length ||
      s.drawing_activities?.length,
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
          <LinkResourceList title="Comics" items={subject.comics} />
        </div>
        <div className="mt-4">
          <LinkResourceList title="Drawing Activities" items={subject.drawing_activities} />
        </div>
      </>
    );
  }
  if (groupId === 'exam' && subject.exam) {
    return <Exam subjectName={subject.__name} exam={subject.exam} />;
  }
  return null;
}

export default function SubjectLessons({ subjectName, subject }) {
  const { child } = useChild();
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    fetchProgress(child)
      .then((p) => setCompleted(p.completed_lessons?.[subjectName] || []))
      .catch(() => setCompleted([]));
  }, [child, subjectName]);

  const lessons = LESSON_GROUPS.filter((g) => g.hasContent(subject));

  async function markComplete(lessonId) {
    await postProgress(child, { completed_lessons: { [subjectName]: [lessonId] } });
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  }

  return (
    <section className="rounded border p-4 dark:border-gray-700" aria-label={subjectName}>
      <h2 className="mb-3 text-lg font-bold">{subjectName}</h2>
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
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => markComplete(lesson.id)}
                      className="mt-3 rounded border px-3 py-1 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
                    >
                      Mark lesson complete
                    </button>
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
