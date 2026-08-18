import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ParentProgressOverview from '../src/components/ParentProgressOverview.jsx';

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('Aliza')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ scores: { Math: 90 }, badges: ['math-star'] }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ scores: {}, badges: [] }) });
  });
});

describe('ParentProgressOverview', () => {
  it('shows progress for both children', async () => {
    render(<ParentProgressOverview />);

    await waitFor(() => {
      expect(screen.getByText('Aliza')).toBeInTheDocument();
      expect(screen.getByText('Saifan')).toBeInTheDocument();
    });

    expect(screen.getByText('Math: 90%')).toBeInTheDocument();
    expect(screen.getByText(/math-star/)).toBeInTheDocument();
    expect(screen.getByText(/No exam scores yet/)).toBeInTheDocument();
  });
});
