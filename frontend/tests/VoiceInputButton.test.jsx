import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceInputButton from '../src/components/VoiceInputButton.jsx';

class MockRecognition {
  start() {
    this.onresult?.({ results: [[{ transcript: 'hello world' }]] });
    this.onend?.();
  }
  stop() {
    this.onend?.();
  }
}

describe('VoiceInputButton', () => {
  beforeEach(() => {
    window.SpeechRecognition = MockRecognition;
  });

  afterEach(() => {
    delete window.SpeechRecognition;
  });

  it('renders nothing when speech recognition is unsupported', () => {
    delete window.SpeechRecognition;
    const { container } = render(<VoiceInputButton onResult={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onResult with the transcript when supported', () => {
    const onResult = vi.fn();
    render(<VoiceInputButton onResult={onResult} label="Speak" />);
    fireEvent.click(screen.getByRole('button', { name: 'Speak' }));
    expect(onResult).toHaveBeenCalledWith('hello world');
  });
});
