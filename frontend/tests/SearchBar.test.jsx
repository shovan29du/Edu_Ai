import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../src/components/SearchBar.jsx';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { title: 'Phonics for Beginners', subject: 'English', resource_type: 'video_resources', url: 'https://example.com' },
        ]),
    })
  );
});

describe('SearchBar', () => {
  it('shows results only from safe backend search', async () => {
    render(<SearchBar standard={1} />);
    fireEvent.change(screen.getByLabelText('Search safe resources for this grade'), {
      target: { value: 'phonics' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('Phonics for Beginners')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/search/1?q=phonics');
  });

  it('shows a no-results message for empty search response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    render(<SearchBar standard={1} />);
    fireEvent.change(screen.getByLabelText('Search safe resources for this grade'), {
      target: { value: 'xyz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('No safe results found.')).toBeInTheDocument();
    });
  });
});
