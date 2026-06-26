import React from 'react';
import BookList from './BookList.jsx';
import MediaSection from './MediaSection.jsx';
import InfographicGrid from './InfographicGrid.jsx';
import InfoCardGrid from './InfoCardGrid.jsx';
import LinkResourceList from './LinkResourceList.jsx';
import Exam from './Exam.jsx';

export default function SyllabusCard({ subjectName, subject }) {
  return (
    <section className="rounded border p-4 dark:border-gray-700" aria-label={subjectName}>
      <h2 className="mb-3 text-lg font-bold">{subjectName}</h2>
      <BookList books={subject.books} />
      <div className="mt-4">
        <MediaSection title="Videos" videos={subject.video_resources} />
      </div>
      {subject.cartoon_videos?.length > 0 && (
        <div className="mt-4">
          <MediaSection title="Cartoons" videos={subject.cartoon_videos} />
        </div>
      )}
      {subject.infographics?.length > 0 && (
        <div className="mt-4">
          <InfographicGrid infographics={subject.infographics} />
        </div>
      )}
      {subject.info_cards?.length > 0 && (
        <div className="mt-4">
          <InfoCardGrid infoCards={subject.info_cards} />
        </div>
      )}
      <div className="mt-4">
        <LinkResourceList title="Text Resources" items={subject.text_resources} />
      </div>
      <div className="mt-4">
        <LinkResourceList title="Textbooks" items={subject.textbooks} />
      </div>
      <div className="mt-4">
        <LinkResourceList title="Audio" items={subject.audio_resources} />
      </div>
      <div className="mt-4">
        <LinkResourceList title="Comics" items={subject.comics} />
      </div>
      <div className="mt-4">
        <LinkResourceList title="Drawing Activities" items={subject.drawing_activities} />
      </div>
      {subject.exam && (
        <div className="mt-4">
          <Exam subjectName={subjectName} exam={subject.exam} />
        </div>
      )}
    </section>
  );
}
