import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovieCard from './MovieCard';
import type { TMDBMovie, TMDBTVShow, ContentType } from '@/types/tmdb';

interface MovieRowProps {
  title: string;
  items: (TMDBMovie | TMDBTVShow)[];
  type: ContentType;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, items, type }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const validItems = items?.filter((item) => item.poster_path) || [];
  if (!validItems.length) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="px-4 md:px-8 mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h2>
      </div>

      <div className="relative group/row">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-20 w-10 rounded-none bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex items-center justify-center"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {validItems.map((item) => (
            <div key={item.id} className="flex-none w-[140px] md:w-[180px]">
              <MovieCard item={item} type={type} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-20 w-10 rounded-none bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hidden md:flex items-center justify-center"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  );
};

export default MovieRow;
