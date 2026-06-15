import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { searchMulti } from '@/lib/tmdb-client';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await searchMulti(searchQuery.trim());
      const filtered = data.results.filter((item) => {
        const mt = (item as unknown as Record<string, unknown>).media_type;
        return (mt === 'movie' || mt === 'tv') && !!item.poster_path;
      });
      setResults(filtered as (TMDBMovie | TMDBTVShow)[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const getItemType = (item: TMDBMovie | TMDBTVShow): 'movie' | 'tv' => {
    return 'title' in item ? 'movie' : 'tv';
  };

  return (
    <div className="px-4 md:px-8 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground text-sm">
            Showing results for "{query}"
          </p>
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

      {!loading && !error && query && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {results.map((item) => (
            <MovieCard
              key={`${getItemType(item)}-${item.id}`}
              item={item}
              type={getItemType(item)}
            />
          ))}
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-base">No results found for "{query}"</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try searching for a different movie or TV show title.
          </p>
        </div>
      )}

      {!query && (
        <div className="flex flex-col items-center justify-center py-20">
          <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-base">Enter a search term to find movies and TV shows</p>
        </div>
      )}
    </div>
  );
};

export default Search;
