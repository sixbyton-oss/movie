import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  watchedAt: string;
  runtimeMinutes: number;
}

interface DashboardStats {
  hoursWatched: number;
  genresExplored: number[];
  reviewsCount: number;
  recentlyWatched: WatchedItem[];
}

interface DashboardStatsContextType extends DashboardStats {
  trackWatch: (item: Omit<WatchedItem, 'watchedAt'>) => void;
  trackGenres: (genreIds: number[]) => void;
  incrementReviews: () => void;
  clearStats: () => void;
}

const STORAGE_KEY = 'byton-dashboard-stats';

const defaultStats: DashboardStats = {
  hoursWatched: 0,
  genresExplored: [],
  reviewsCount: 0,
  recentlyWatched: [],
};

const DashboardStatsContext = createContext<DashboardStatsContextType | undefined>(undefined);

export const DashboardStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStats({
          hoursWatched: parsed.hoursWatched || 0,
          genresExplored: Array.isArray(parsed.genresExplored) ? parsed.genresExplored : [],
          reviewsCount: parsed.reviewsCount || 0,
          recentlyWatched: Array.isArray(parsed.recentlyWatched) ? parsed.recentlyWatched : [],
        });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const trackWatch = useCallback((item: Omit<WatchedItem, 'watchedAt'>) => {
    setStats((prev) => {
      const hours = item.runtimeMinutes > 0 ? item.runtimeMinutes / 60 : 0.5;
      const newRecently = [
        { ...item, watchedAt: new Date().toISOString() },
        ...prev.recentlyWatched.filter((w) => !(w.id === item.id && w.type === item.type)),
      ].slice(0, 20);
      return {
        ...prev,
        hoursWatched: Math.round((prev.hoursWatched + hours) * 10) / 10,
        recentlyWatched: newRecently,
      };
    });
  }, []);

  const trackGenres = useCallback((genreIds: number[]) => {
    setStats((prev) => {
      const merged = Array.from(new Set([...prev.genresExplored, ...genreIds]));
      return { ...prev, genresExplored: merged };
    });
  }, []);

  const incrementReviews = useCallback(() => {
    setStats((prev) => ({ ...prev, reviewsCount: prev.reviewsCount + 1 }));
  }, []);

  const clearStats = useCallback(() => {
    setStats(defaultStats);
  }, []);

  return (
    <DashboardStatsContext.Provider
      value={{
        ...stats,
        trackWatch,
        trackGenres,
        incrementReviews,
        clearStats,
      }}
    >
      {children}
    </DashboardStatsContext.Provider>
  );
};

export const useDashboardStats = () => {
  const context = useContext(DashboardStatsContext);
  if (!context) throw new Error('useDashboardStats must be used within DashboardStatsProvider');
  return context;
};
