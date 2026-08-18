import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomExportForm from '../src/components/CustomExportForm.jsx';

beforeEach(() => {
  global.fetch = vi.fn((url, options) => {
    if (url === '/api/grade/1') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subjects: { Math: {}, English: {} } }),
      });
    }
    return Promise.resolve({
      ok: true,
      headers: { get: () => 'attachment; filename="grade1-custom.pdf"' },
      blob: () => Promise.resolve(new Blob(['data'])),
    });
  });
  global.URL.createObjectURL = vi.fn(() => 'blob:mock');
  global.URL.revokeObjectURL = vi.fn();
});

describe('CustomExportForm', () => {
  it('lists subjects from the grade and submits a custom export request', async () => {
    render(<CustomExportForm standard={1} resourceTypeLabels={{ books: 'Book' }} />);

    await waitFor(() => {
      expect(screen.getByText('Math')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Math'));
    fireEvent.click(screen.getByLabelText('Book'));
    fireEvent.click(screen.getByLabelText('DOC (.docx)'));
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/grade/1/export/custom',
        expect.objectContaining({ method: 'POST' })
      );
    });
    const call = global.fetch.mock.calls.find(([url]) => url === '/api/grade/1/export/custom');
    const body = JSON.parse(call[1].body);
    expect(body).toEqual({ subjects: ['Math'], resource_types: ['books'], format: 'docx' });
  });
});
