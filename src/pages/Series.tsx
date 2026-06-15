import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MovieCard from '@/components/MovieCard';
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getOnAirTVShows,
  getTVGenres,
  discoverTVShows,
} from '@/lib/tmdb-client';
import type { TMDBTVShow, TMDBGenre } from '@/types/tmdb';

type Category = 'popular' | 'top_rated' | 'on_the_air';

const categoryLabels: Record<Category, string> = {
  popular: 'Popular',
  top_rated: 'Top Rated',
  on_the_air: 'On The Air',
};

const Series: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shows, setShows] = useState<TMDBTVShow[]>([]);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = (searchParams.get('category') as Category) || 'popular';

  const fetchShows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (category) {
        case 'top_rated':
          response = await getTopRatedTVShows();
          break;
        case 'on_the_air':
          response = await getOnAirTVShows();
          break;
        default:
          response = await getPopularTVShows();
      }
      setShows(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load series');
    } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchByGenre = useCallback(async () => {
    if (!selectedGenre) return;
    try {
      setLoading(true);
      setError(null);
      const response = await discoverTVShows({ with_genres: selectedGenre, sort_by: 'popularity.desc' });
      setShows(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load series');
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getTVGenres();
        setGenres(data.genres);
      } catch {
        // silently fail
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      fetchByGenre();
    } else {
      fetchShows();
    }
  }, [category, selectedGenre, fetchShows, fetchByGenre]);

  const handleCategoryChange = (value: string) => {
    setSelectedGenre('');
    setSearchParams({ category: value });
  };

  const validShows = shows?.filter((s) => s.poster_path) || [];

  return (
    <div className="px-4 md:px-8 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Series
        </h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
        <Tabs value={category} onValueChange={handleCategoryChange}>
          <TabsList className="bg-muted/50 h-9">
            {(Object.keys(categoryLabels) as Category[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {categoryLabels[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {genres.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="h-9 px-3 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.name}
                </option>
              ))}
            </select>
            {selectedGenre && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedGenre('')}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-destructive text-base mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your TMDB API key configuration.
          </p>
        </div>
      )}

      {!loading && !error && validShows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {validShows.map((show) => (
            <MovieCard key={show.id} item={show} type="tv" />
          ))}
        </div>
      )}

      {!loading && !error && validShows.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No TV shows found.</p>
        </div>
      )}
    </div>
  );
};

export default Series;
