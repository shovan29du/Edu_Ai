import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadAloudButton from '../src/components/ReadAloudButton.jsx';

beforeEach(() => {
  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
  };
  global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({ text }));
});

describe('ReadAloudButton', () => {
  it('renders nothing when there is no text', () => {
    const { container } = render(<ReadAloudButton text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('speaks the given text when clicked', () => {
    render(<ReadAloudButton text="Hello world" />);
    fireEvent.click(screen.getByRole('button', { name: /Read aloud/ }));
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Stop/ })).toBeInTheDocument();
  });

  it('stops speaking when clicked again', () => {
    render(<ReadAloudButton text="Hello world" />);
    fireEvent.click(screen.getByRole('button', { name: /Read aloud/ }));
    fireEvent.click(screen.getByRole('button', { name: /Stop/ }));
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Read aloud/ })).toBeInTheDocument();
  });
});
