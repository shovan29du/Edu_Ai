import { useCallback, useEffect, useState } from 'react';
import { useChild } from '../contexts/ChildContext.jsx';

function storageKey(child) {
  return `favorites_${child}`;
}

const FAVORITES_CHANGED_EVENT = 'favorites-changed';

function resourceKey(resource) {
  return resource.link || resource.url || resource.title;
}

function readFavorites(child) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(child))) || [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const { child } = useChild();
  const [favorites, setFavorites] = useState(() => readFavorites(child));

  useEffect(() => {
    setFavorites(readFavorites(child));
    function handleChange() {
      setFavorites(readFavorites(child));
    }
    window.addEventListener(FAVORITES_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handleChange);
  }, [child]);

  const persist = useCallback(
    (next) => {
      localStorage.setItem(storageKey(child), JSON.stringify(next));
      window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
    },
    [child]
  );

  const isFavorite = useCallback(
    (resource) => favorites.some((f) => resourceKey(f) === resourceKey(resource)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (resource) => {
      if (isFavorite(resource)) {
        persist(favorites.filter((f) => resourceKey(f) !== resourceKey(resource)));
      } else {
        persist([...favorites, resource]);
      }
    },
    [favorites, isFavorite, persist]
  );

  return { favorites, isFavorite, toggleFavorite };
}
