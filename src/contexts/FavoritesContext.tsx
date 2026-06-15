import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FavoriteItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage: number;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: number, type: 'movie' | 'tv') => boolean;
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: number, type: 'movie' | 'tv') => void;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
}

const STORAGE_KEY = 'byton-favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number, type: 'movie' | 'tv') => {
      return favorites.some((f) => f.id === id && f.type === type);
    },
    [favorites]
  );

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id && f.type === item.type)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFavorite = useCallback((id: number, type: 'movie' | 'tv') => {
    setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));
  }, []);

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'addedAt'>) => {
      if (isFavorite(item.id, item.type)) {
        removeFavorite(item.id, item.type);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
