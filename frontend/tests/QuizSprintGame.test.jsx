import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizSprintGame from '../src/components/QuizSprintGame.jsx';

const grade = {
  subjects: {
    English: {
      quiz_bank: [
        {
          question: "Which word rhymes with 'cat'?",
          type: 'multiple_choice',
          options: ['dog', 'hat', 'sun'],
          answer: 'hat',
        },
      ],
    },
  },
};

describe('QuizSprintGame', () => {
  it('starts the round and shows a question with options', () => {
    render(<QuizSprintGame grade={grade} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByText("Which word rhymes with 'cat'?")).toBeInTheDocument();
    expect(screen.getByText('hat')).toBeInTheDocument();
  });

  it('shows a message when no quiz questions exist for the grade', () => {
    render(<QuizSprintGame grade={{ subjects: {} }} />);
    expect(screen.getByText(/No quiz questions available/)).toBeInTheDocument();
  });
});
