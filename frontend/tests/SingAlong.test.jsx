import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SingAlong from '../src/components/SingAlong.jsx';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: 'Twinkle, Twinkle, Little Star',
            source: 'Traditional / public domain',
            lyrics: ['Twinkle, twinkle, little star,', 'How I wonder what you are!'],
            channelUrl: 'https://www.youtube.com/channel/UCLsooMJoIpl_7ux2jvdPB-Q',
            safe: true,
          },
        ]),
    })
  );
});

describe('SingAlong', () => {
  it('shows lyrics for the selected song', async () => {
    render(<SingAlong />);

    await waitFor(() => {
      expect(screen.getByText('Twinkle, twinkle, little star,')).toBeInTheDocument();
    });
    expect(screen.getByText('How I wonder what you are!')).toBeInTheDocument();
  });
});
