import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Exam from '../src/components/Exam.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

const exam = {
  questions: [
    { question: 'What is 2 + 2?', type: 'multiple_choice', options: ['3', '4', '5'], answer: '4' },
    { question: 'Spell cat', type: 'short_answer', answer: 'cat' },
  ],
  passing_score: 60,
};

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
});

describe('Exam', () => {
  it('grades correct answers as a pass and posts progress', async () => {
    render(
      <ChildProvider>
        <Exam subjectName="Math" exam={exam} />
      </ChildProvider>
    );

    fireEvent.click(screen.getByLabelText('4'));
    fireEvent.change(screen.getByLabelText('Spell cat'), { target: { value: 'cat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));

    await waitFor(() => {
      expect(screen.getByText(/Passed/)).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/progress/Aliza',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('grades incorrect answers as a fail and shows the correct answer', async () => {
    render(
      <ChildProvider>
        <Exam subjectName="Math" exam={exam} />
      </ChildProvider>
    );

    fireEvent.click(screen.getByLabelText('3'));
    fireEvent.change(screen.getByLabelText('Spell cat'), { target: { value: 'dog' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));

    await waitFor(() => {
      expect(screen.getByText(/Try again/)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Correct answer:/).length).toBe(2);
  });

  it('disables submit until every question is answered', () => {
    render(
      <ChildProvider>
        <Exam subjectName="Math" exam={exam} />
      </ChildProvider>
    );

    expect(screen.getByRole('button', { name: 'Submit Exam' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('4'));
    expect(screen.getByRole('button', { name: 'Submit Exam' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Spell cat'), { target: { value: 'cat' } });
    expect(screen.getByRole('button', { name: 'Submit Exam' })).not.toBeDisabled();
  });

  it('lets the child retry the exam after grading', async () => {
    render(
      <ChildProvider>
        <Exam subjectName="Math" exam={exam} />
      </ChildProvider>
    );

    fireEvent.click(screen.getByLabelText('4'));
    fireEvent.change(screen.getByLabelText('Spell cat'), { target: { value: 'cat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));
    await waitFor(() => screen.getByText(/Passed/));

    fireEvent.click(screen.getByRole('button', { name: 'Retry exam' }));
    expect(screen.queryByText(/Passed/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Exam' })).toBeDisabled();
  });
});
