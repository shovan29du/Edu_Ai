import React from 'react';
import { useFavorites } from '../hooks/useFavorites.js';

export default function FavoriteButton({ resource }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(resource);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(resource)}
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${resource.title} from favourites` : `Add ${resource.title} to favourites`}
      className="rounded border px-2 py-0.5 text-sm focus:outline focus:outline-2 focus:outline-blue-500"
    >
      {favorited ? '★ Favourited' : '☆ Favourite'}
    </button>
  );
}
