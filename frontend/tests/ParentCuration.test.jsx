import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParentCuration from '../src/components/ParentCuration.jsx';

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.startsWith('/api/web-search')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { title: 'Free Math Game', url: 'https://example.com/math-game', description: 'A fun math game.' },
          ]),
      });
    }
    if (url === '/api/curate-resource') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ safe: true }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('ParentCuration', () => {
  it('searches the web and lists results for review', async () => {
    render(<ParentCuration standard={1} />);
    fireEvent.change(screen.getByLabelText('Search query'), { target: { value: 'math games' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search web' }));

    await waitFor(() => {
      expect(screen.getByText('Free Math Game')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/web-search?q=math%20games');
  });

  it('requires a subject before adding a resource', async () => {
    render(<ParentCuration standard={1} />);
    fireEvent.change(screen.getByLabelText('Search query'), { target: { value: 'math games' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search web' }));
    await waitFor(() => screen.getByText('Free Math Game'));

    fireEvent.click(screen.getByRole('button', { name: 'Add to syllabus' }));
    await waitFor(() => {
      expect(screen.getByText('Enter a subject name before adding a resource.')).toBeInTheDocument();
    });
  });

  it('adds a reviewed resource to the syllabus via curate-resource', async () => {
    render(<ParentCuration standard={1} />);
    fireEvent.change(screen.getByLabelText('Search query'), { target: { value: 'math games' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search web' }));
    await waitFor(() => screen.getByText('Free Math Game'));

    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Math' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to syllabus' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Added ✓' })).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/curate-resource',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
