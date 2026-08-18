import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResourceLibrary from '../src/components/ResourceLibrary.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

const grade = {
  standard: 1,
  subjects: {
    Math: {
      books: [{ title: 'Safe Math Book', link: 'https://example.com', safe: true }],
      video_resources: [{ title: 'Safe Math Video', url: 'https://example.com', safe: true }],
    },
    English: {
      books: [{ title: 'Unsafe Book', link: 'https://example.com', safe: false }],
      video_resources: [],
    },
  },
};

beforeEach(() => localStorage.clear());

describe('ResourceLibrary', () => {
  it('lists books by default and switches tabs to videos', () => {
    render(
      <ChildProvider>
        <ResourceLibrary grade={grade} />
      </ChildProvider>
    );
    expect(screen.getByText('Safe Math Book')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Videos' }));
    expect(screen.getByText('Safe Math Video')).toBeInTheDocument();
  });

  it('hides unsafe resources when restricted mode is on', () => {
    localStorage.setItem('isRestricted', 'true');
    render(
      <ChildProvider>
        <ResourceLibrary grade={grade} />
      </ChildProvider>
    );
    expect(screen.queryByText('Unsafe Book')).not.toBeInTheDocument();
  });
});
