import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButton from '../src/components/ExportButton.jsx';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      headers: { get: () => 'attachment; filename="report.csv"' },
      blob: () => Promise.resolve(new Blob(['data'])),
    })
  );
  global.URL.createObjectURL = vi.fn(() => 'blob:mock');
  global.URL.revokeObjectURL = vi.fn();
});

describe('ExportButton', () => {
  it('fetches the export url and triggers a download on click', async () => {
    render(<ExportButton url="/api/progress/Aliza/export?format=csv" fallbackFilename="x.csv" label="Export CSV" />);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/progress/Aliza/export?format=csv', undefined);
    });
  });

  it('shows an error message when the export fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }));
    render(<ExportButton url="/api/progress/Aliza/export" fallbackFilename="x.csv" label="Export CSV" />);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
