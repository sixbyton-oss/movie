import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBackdropUrl, getImageUrl, formatVote } from '@/lib/tmdb-client';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface HeroBannerProps {
  item: TMDBMovie | TMDBTVShow;
  type: 'movie' | 'tv';
}

const HeroBanner: React.FC<HeroBannerProps> = ({ item, type }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const backdropUrl = getBackdropUrl(item.backdrop_path);
  const posterUrl = getImageUrl(item.poster_path, 'w500');

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[75vh] flex items-end">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {backdropUrl && (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={backdropUrl}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 md:px-8 pb-8 md:pb-16 pt-32">
        <div className="max-w-3xl">
          {/* Poster thumbnail on mobile */}
          {posterUrl && (
            <div className="md:hidden w-24 aspect-[2/3] rounded-md overflow-hidden mb-4 shadow-lg">
              <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              {type === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {year && (
              <span className="text-xs text-muted-foreground">{year}</span>
            )}
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Star className="h-3 w-3" fill="currentColor" />
              <span>{formatVote(item.vote_average)}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight mb-3 text-balance">
            {title}
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 line-clamp-3 md:line-clamp-4">
            {item.overview}
          </p>

          <div className="flex items-center gap-3">
            <Link to={`/${type}/${item.id}`}>
              <Button
                className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <Info className="h-4 w-4 mr-2" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
