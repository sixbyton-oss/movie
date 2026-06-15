import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Film,
  Tv,
  Search,
  Heart,
  LayoutDashboard,
  X,
  Circle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { getMovieGenres } from '@/lib/tmdb-client';
import type { TMDBGenre } from '@/types/tmdb';

const menuItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Movies', path: '/movies', icon: Film },
  { name: 'Series', path: '/series', icon: Tv },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Favorites', path: '/favorites', icon: Heart },
];

const defaultGenres: TMDBGenre[] = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const location = useLocation();
  const [genres, setGenres] = useState<TMDBGenre[]>(defaultGenres);

  useEffect(() => {
    getMovieGenres()
      .then((data) => {
        if (data.genres?.length) setGenres(data.genres);
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 mb-8"
      >
        <img src="/logo.png" alt="Byton Movies" className="h-8 w-8 object-contain" />
        <span className="text-lg font-bold tracking-tight">
          <span className="text-foreground">BYTON</span>
          <span className="text-primary">MOVIES</span>
        </span>
      </Link>

      {/* Menu */}
      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
      </div>
      <nav className="flex flex-col gap-1 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Genres */}
      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Genres
        </p>
      </div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {genres.slice(0, 8).map((g) => (
          <Link
            key={g.id}
            to={`/movies?category=popular&genre=${g.id}`}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
            {g.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/30 backdrop-blur-sm h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-[60] text-foreground hover:bg-muted/50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-card border-r border-border p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
