import React from 'react';
import PhonicsMatchGame from './PhonicsMatchGame.jsx';
import QuizSprintGame from './QuizSprintGame.jsx';

export default function Games({ grade }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Games</h2>
      <PhonicsMatchGame />
      <QuizSprintGame grade={grade} />
    </div>
  );
}
