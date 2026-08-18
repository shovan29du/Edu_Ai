import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeEditor from '../src/components/CodeEditor.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

beforeEach(() => {
  localStorage.clear();
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
});

describe('CodeEditor', () => {
  it('renders default code and lets the user edit it', () => {
    render(
      <ChildProvider>
        <CodeEditor />
      </ChildProvider>
    );
    const textarea = screen.getByLabelText('JavaScript code');
    expect(textarea.value).toContain('Hello, world!');
    fireEvent.change(textarea, { target: { value: 'console.log(1+1)' } });
    expect(textarea.value).toBe('console.log(1+1)');
  });

  it('saves a snippet via the progress API', async () => {
    render(
      <ChildProvider>
        <CodeEditor />
      </ChildProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save snippet' }));
    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/progress/Aliza',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
