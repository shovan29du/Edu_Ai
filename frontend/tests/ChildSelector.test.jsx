import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChildSelector from '../src/components/ChildSelector.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

beforeEach(() => {
  localStorage.clear();
});

describe('ChildSelector', () => {
  it('changes selected child and persists to localStorage', () => {
    render(
      <ChildProvider>
        <ChildSelector />
      </ChildProvider>
    );
    const select = screen.getByLabelText('Select profile');
    fireEvent.change(select, { target: { value: 'Saifan' } });
    expect(select.value).toBe('Saifan');
    expect(localStorage.getItem('selectedChild')).toBe('Saifan');
  });

  it('includes a Parent profile option', () => {
    render(
      <ChildProvider>
        <ChildSelector />
      </ChildProvider>
    );
    const select = screen.getByLabelText('Select profile');
    fireEvent.change(select, { target: { value: 'Parent' } });
    expect(select.value).toBe('Parent');
  });

  it('includes Shovan and Bely parent profile options', () => {
    render(
      <ChildProvider>
        <ChildSelector />
      </ChildProvider>
    );
    const select = screen.getByLabelText('Select profile');
    fireEvent.change(select, { target: { value: 'Shovan' } });
    expect(select.value).toBe('Shovan');
    fireEvent.change(select, { target: { value: 'Bely' } });
    expect(select.value).toBe('Bely');
  });
});
