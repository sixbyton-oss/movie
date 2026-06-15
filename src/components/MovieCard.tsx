import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Heart } from 'lucide-react';
import { getImageUrl, formatVote } from '@/lib/tmdb-client';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { TMDBMovie, TMDBTVShow, ContentType } from '@/types/tmdb';

interface MovieCardProps {
  item: TMDBMovie | TMDBTVShow;
  type: ContentType;
  showBadge?: boolean;
  showFavorite?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, type, showBadge = true, showFavorite = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const posterUrl = getImageUrl(item.poster_path, 'w342');
  const year = date ? new Date(date).getFullYear() : '';
  const fav = isFavorite(item.id, type);

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: item.id,
      type,
      title,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
    });
  };

  return (
    <Link
      to={`/${type}/${item.id}`}
      className="group block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        {/* Film badge */}
        {showBadge && (
          <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            {type === 'movie' ? 'Film' : 'Series'}
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-yellow-400 font-medium">
          <Star className="h-2.5 w-2.5" fill="currentColor" />
          {formatVote(item.vote_average)}
        </div>

        {/* Favorite button */}
        {showFavorite && (
          <button
            onClick={handleFavClick}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
          >
            <Heart
              className={`h-3.5 w-3.5 ${fav ? 'text-red-500 fill-red-500' : 'text-white'}`}
            />
          </button>
        )}

        {/* Placeholder skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Title and year */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-foreground truncate leading-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {year || 'N/A'}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
