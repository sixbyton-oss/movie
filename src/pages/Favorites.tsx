import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getImageUrl, formatVote } from '@/lib/tmdb-client';

const Favorites: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="px-4 md:px-8 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-base text-muted-foreground mb-2">No favorites yet</p>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Browse movies and series, then click the heart icon to save your favorites here.
          </p>
          <Button asChild>
            <Link to="/movies">Browse Movies</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favorites.map((fav) => (
            <div key={`${fav.type}-${fav.id}`} className="group relative">
              <Link to={`/${fav.type}/${fav.id}`} className="block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                  <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {fav.type === 'movie' ? 'Film' : 'Series'}
                  </div>
                  {fav.voteAverage > 0 && (
                    <div className="absolute bottom-2 left-2 z-10 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-yellow-400 font-medium">
                      {formatVote(fav.voteAverage)}
                    </div>
                  )}
                  {fav.posterPath && (
                    <img
                      src={getImageUrl(fav.posterPath, 'w342')}
                      alt={fav.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{fav.title}</p>
              </Link>
              <button
                onClick={() => removeFavorite(fav.id, fav.type)}
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
              >
                <Heart className="h-3 w-3 text-white fill-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
