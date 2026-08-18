import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhonicsMatchGame from '../src/components/PhonicsMatchGame.jsx';

describe('PhonicsMatchGame', () => {
  it('shows a letter and option buttons for the first round', () => {
    render(<PhonicsMatchGame />);
    expect(screen.getByText('Phonics Match')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3);
  });
});
