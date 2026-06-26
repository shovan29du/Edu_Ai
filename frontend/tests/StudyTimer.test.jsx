import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import StudyTimer from '../src/components/StudyTimer.jsx';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('StudyTimer', () => {
  it('starts in focus mode showing 25:00', () => {
    render(<StudyTimer />);
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByText(/Focus time/)).toBeInTheDocument();
  });

  it('counts down once started', () => {
    render(<StudyTimer />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('24:57');
  });

  it('resets back to 25:00 focus mode', () => {
    render(<StudyTimer />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByText(/Focus time/)).toBeInTheDocument();
  });
});
