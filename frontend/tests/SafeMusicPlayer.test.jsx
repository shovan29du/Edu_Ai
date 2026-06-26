import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SafeMusicPlayer from '../src/components/SafeMusicPlayer.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: 'Sing-along nursery rhymes',
            videoUrl: 'https://www.youtube.com/channel/UCLsooMJoIpl_7ux2jvdPB-Q',
            source: 'Super Simple Songs',
            safe: true,
          },
        ]),
    })
  );
});

describe('SafeMusicPlayer', () => {
  it('lists only approved safe songs returned by the backend', async () => {
    render(
      <ChildProvider>
        <SafeMusicPlayer />
      </ChildProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sing-along nursery rhymes')).toBeInTheDocument();
    });
    expect(screen.getByText('Super Simple Songs')).toBeInTheDocument();
  });
});
