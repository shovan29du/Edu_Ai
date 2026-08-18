import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from '../src/components/FavoriteButton.jsx';
import FavoritesList from '../src/components/FavoritesList.jsx';
import { ChildProvider } from '../src/contexts/ChildContext.jsx';

const book = { title: 'Alice in Wonderland', link: 'https://www.gutenberg.org/ebooks/11' };

beforeEach(() => {
  localStorage.clear();
});

describe('FavoriteButton / FavoritesList', () => {
  it('toggles a resource into favourites and shows it in the list', () => {
    render(
      <ChildProvider>
        <FavoriteButton resource={book} />
        <FavoritesList />
      </ChildProvider>
    );

    expect(screen.getByText(/Nothing favourited yet/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Alice in Wonderland to favourites/ }));

    expect(screen.getAllByText('Alice in Wonderland').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Nothing favourited yet/)).not.toBeInTheDocument();
  });

  it('removes a resource from favourites when un-toggled', () => {
    render(
      <ChildProvider>
        <FavoriteButton resource={book} />
        <FavoritesList />
      </ChildProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Alice in Wonderland to favourites/ }));
    const removeButtons = screen.getAllByRole('button', {
      name: /Remove Alice in Wonderland from favourites/,
    });
    fireEvent.click(removeButtons[0]);

    expect(screen.getByText(/Nothing favourited yet/)).toBeInTheDocument();
  });

  it('persists favourites per child via localStorage', () => {
    render(
      <ChildProvider>
        <FavoriteButton resource={book} />
      </ChildProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /Add Alice in Wonderland to favourites/ }));

    expect(JSON.parse(localStorage.getItem('favorites_Aliza'))).toHaveLength(1);
  });
});
