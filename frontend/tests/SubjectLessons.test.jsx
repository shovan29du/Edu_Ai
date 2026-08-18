import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubjectLessons from '../src/components/SubjectLessons.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

vi.mock('../src/components/MediaSection.jsx', () => ({
  default: ({ title }) => <div>{title}</div>,
}));

const subject = {
  books: [{ id: 'b1', title: 'A Book', link: 'https://example.com', safe: true }],
  video_resources: [{ title: 'A Video', url: 'https://www.youtube.com/watch?v=abc123', safe: true }],
  info_cards: [{ title: 'A Card', fact: 'A fact', safe: true }],
};

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn((url) => {
    if (url === '/api/progress/Aliza') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ completed_lessons: {} }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('SubjectLessons', () => {
  it('locks later lessons until the previous one is marked complete', async () => {
    render(
      <ChildProvider>
        <SubjectLessons subjectName="Math" subject={subject} />
      </ChildProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lesson 1: Learn')).toBeInTheDocument();
    });
    expect(screen.getByText(/Complete "Learn" first/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark lesson complete' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/progress/Aliza',
        expect.objectContaining({ method: 'POST' })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText(/Complete "Learn" first/)).not.toBeInTheDocument();
    });
    expect(screen.getByText('Lesson 2: Watch')).toBeInTheDocument();
  });
});
