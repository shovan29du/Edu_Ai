import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ColouringCanvas from '../src/components/ColouringCanvas.jsx';

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(480 * 360 * 4) })),
    putImageData: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
  }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,fake');
});

describe('ColouringCanvas', () => {
  it('renders all tools and switches the active tool', () => {
    render(<ColouringCanvas />);
    const fillButton = screen.getByRole('button', { name: 'fill', pressed: false });
    fireEvent.click(fillButton);
    expect(screen.getByRole('button', { name: 'fill', pressed: true })).toBeInTheDocument();
  });

  it('updates colour and brush size controls', () => {
    render(<ColouringCanvas />);
    fireEvent.change(screen.getByLabelText('Colour picker'), { target: { value: '#ff0000' } });
    fireEvent.change(screen.getByLabelText('Brush size'), { target: { value: '15' } });
    expect(screen.getByLabelText('Colour picker').value).toBe('#ff0000');
    expect(screen.getByLabelText('Brush size').value).toBe('15');
  });

  it('triggers a PNG download on save', () => {
    render(<ColouringCanvas />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as PNG' }));
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/png');
  });
});
