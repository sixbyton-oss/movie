import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, Compass, Monitor, Shield } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDashboardStats } from '@/contexts/DashboardStatsContext';
import { getImageUrl } from '@/lib/tmdb-client';

const Dashboard: React.FC = () => {
  const { favorites } = useFavorites();
  const { hoursWatched, genresExplored, reviewsCount, recentlyWatched } = useDashboardStats();

  const stats = [
    { label: 'Watchlist', value: favorites.length, icon: Heart },
    { label: 'Reviews', value: reviewsCount, icon: Star },
    { label: 'Hours Watched', value: hoursWatched, icon: Clock },
    { label: 'Genres Explored', value: genresExplored.length, icon: Compass },
  ];

  return (
    <div className="px-4 md:px-8 py-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center">
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>
      {/* Backup Status */}
      <div className="mb-8">
        <div className="w-full bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Project Backup Ready</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Full source code backed up at tasks/bytontv/
            </p>
          </div>
        </div>
      </div>
      {/* Favorites */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Favorites
          </h2>
          <Link to="/favorites" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No favorites yet. Browse movies and series and hit the heart to save them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {favorites.slice(0, 10).map((fav) => (
              <Link
                key={`${fav.type}-${fav.id}`}
                to={`/${fav.type}/${fav.id}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                  <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {fav.type === 'movie' ? 'Film' : 'Series'}
                  </div>
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
            ))}
          </div>
        )}
      </div>
      {/* Recently Watched */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recently Watched
          </h2>
        </div>

        {recentlyWatched.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nothing watched yet. Start streaming to see your history here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {recentlyWatched.slice(0, 10).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={`/${item.type}/${item.id}`}
                className="group block"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                  <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {item.type === 'movie' ? 'Film' : 'Series'}
                  </div>
                  {item.posterPath && (
                    <img
                      src={getImageUrl(item.posterPath, 'w342')}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
