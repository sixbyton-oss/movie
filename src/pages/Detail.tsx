import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Star, Heart, Play, Film, Tv, ChevronDown, Monitor, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getMovieDetails,
  getTVShowDetails,
  getMovieRecommendations,
  getTVRecommendations,
  getTVSeasonDetails,
  getImageUrl,
  getBackdropUrl,
  formatYear,
  formatRuntime,
  formatVote,
} from '@/lib/tmdb-client';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDashboardStats } from '@/contexts/DashboardStatsContext';
import type { TMDBMovieDetail, TMDBTVShowDetail, TMDBMovie, TMDBTVShow, TMDBSeasonDetail } from '@/types/tmdb';

const SERVERS = [
  { label: 'Server 1', key: 'autoembed' },
  { label: 'Server 2', key: '2embed' },
];

function buildPlayerUrl(server: string, mediaType: string, tmdbId: number, season?: number, episode?: number): string {
  if (server === 'autoembed') {
    return mediaType === 'movie'
      ? `https://autoembed.co/movie/tmdb/${tmdbId}`
      : `https://autoembed.co/tv/tmdb/${tmdbId}-${season || 1}-${episode || 1}`;
  }
  if (server === '2embed') {
    return mediaType === 'movie'
      ? `https://www.2embed.cc/embed/${tmdbId}`
      : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season || 1}&e=${episode || 1}`;
  }
  return '';
}

const Detail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackWatch, trackGenres } = useDashboardStats();
  const [item, setItem] = useState<TMDBMovieDetail | TMDBTVShowDetail | null>(null);
  const [similar, setSimilar] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Watch mode / player state
  const [watchMode, setWatchMode] = useState(false);
  const [server, setServer] = useState('2embed');

  // TV season/episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonDetail, setSeasonDetail] = useState<TMDBSeasonDetail | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setWatchMode(false);
        setSeasonDetail(null);
        setSelectedSeason(1);
        setSelectedEpisode(1);
        setServer('autoembed');

        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) throw new Error('Invalid ID');

        if (type === 'tv') {
          const [data, recs] = await Promise.all([
            getTVShowDetails(numericId),
            getTVRecommendations(numericId),
          ]);
          if (!data) {
            setError('Failed to load TV show details');
            setLoading(false);
            return;
          }
          setItem(data);
          setSimilar(recs.results?.slice(0, 6) || []);
        } else {
          const [data, recs] = await Promise.all([
            getMovieDetails(numericId),
            getMovieRecommendations(numericId),
          ]);
          if (!data) {
            setError('Failed to load movie details');
            setLoading(false);
            return;
          }
          setItem(data);
          setSimilar(recs.results?.slice(0, 6) || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type, id]);

  // Fetch season details when season changes
  const fetchSeason = useCallback(async (tvId: number, seasonNum: number) => {
    try {
      setSeasonLoading(true);
      const data = await getTVSeasonDetails(tvId, seasonNum);
      if (!data) {
        setSeasonDetail(null);
        return;
      }
      setSeasonDetail(data);
      if (data.episodes && data.episodes.length > 0) {
        setSelectedEpisode(data.episodes[0].episode_number);
      }
    } catch {
      setSeasonDetail(null);
    } finally {
      setSeasonLoading(false);
    }
  }, []);

  useEffect(() => {
    if (type === 'tv' && item) {
      const tvItem = item as TMDBTVShowDetail;
      if (tvItem.seasons && tvItem.seasons.length > 0) {
        const firstRealSeason = tvItem.seasons.find((s) => s.season_number > 0);
        const seasonNum = firstRealSeason?.season_number || 1;
        setSelectedSeason(seasonNum);
        fetchSeason(tvItem.id, seasonNum);
      }
    }
  }, [type, item, fetchSeason]);

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    if (item && type === 'tv') {
      fetchSeason(item.id, seasonNum);
    }
  };

  const handleGoBack = () => {
    if (watchMode) {
      setWatchMode(false);
    } else {
      navigate(-1);
    }
  };

  const handleShare = async () => {
    if (!item) return;
    const shareUrl = `https://byton.co.zw/${isMovie ? 'movie' : 'tv'}/${item.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', { description: shareUrl });
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-destructive text-base mb-4">{error || 'Content not found'}</p>
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const isMovie = type === 'movie';
  const title = isMovie ? (item as TMDBMovieDetail).title : (item as TMDBTVShowDetail).name;
  const date = isMovie
    ? (item as TMDBMovieDetail).release_date
    : (item as TMDBTVShowDetail).first_air_date;
  const year = formatYear(date);
  const runtime = isMovie ? formatRuntime((item as TMDBMovieDetail).runtime) : null;
  const backdropUrl = getBackdropUrl(item.backdrop_path);
  const posterUrl = getImageUrl(item.poster_path, 'w500');
  const genres = item.genres || [];
  const cast = item.credits?.cast?.slice(0, 8) || [];

  const isFav = isFavorite(item.id, isMovie ? 'movie' : 'tv');

  const handleToggleFav = () => {
    toggleFavorite({
      id: item.id,
      type: isMovie ? 'movie' : 'tv',
      title,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
    });
  };

  const handleEnterWatchMode = (episodeRuntime?: number) => {
    const runtimeMinutes = isMovie
      ? (item as TMDBMovieDetail).runtime || 120
      : episodeRuntime || 45;
    trackWatch({
      id: item.id,
      type: isMovie ? 'movie' : 'tv',
      title,
      posterPath: item.poster_path,
      runtimeMinutes,
    });
    trackGenres(item.genres?.map((g) => g.id) || []);
    setWatchMode(true);
  };

  const getStatus = () => {
    if (isMovie) return (item as TMDBMovieDetail).status || 'Released';
    return (item as TMDBTVShowDetail).status || 'Unknown';
  };

  const getLanguage = () => {
    const lang = item.original_language?.toUpperCase();
    return lang || 'EN';
  };

  const getBudget = () => {
    if (!isMovie) return null;
    const b = (item as TMDBMovieDetail).budget;
    if (!b || b === 0) return null;
    return `$${(b / 1_000_000).toFixed(0)}M`;
  };

  const getRevenue = () => {
    if (!isMovie) return null;
    const r = (item as TMDBMovieDetail).revenue;
    if (!r || r === 0) return null;
    return `$${(r / 1_000_000).toFixed(0)}M`;
  };

  const totalSeasons = !isMovie ? (item as TMDBTVShowDetail).number_of_seasons || 0 : 0;
  const totalEpisodesForSeason = seasonDetail?.episodes?.length || 0;
  const playerUrl = buildPlayerUrl(server, type || 'movie', item.id, selectedSeason, selectedEpisode);

  return (
    <div className="animate-fade-in">
      {/* Backdrop */}
      <div className="relative w-full h-[35vh] md:h-[50vh]">
        {backdropUrl && (
          <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="absolute top-4 left-4 md:top-6 md:left-8 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {watchMode ? 'Back to details' : 'Back'}
        </Button>
      </div>

      {watchMode ? (
        /* Watch Mode */
        <div className="px-4 md:px-8 pb-12 -mt-16 md:-mt-28 relative z-10">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
              {title}
            </h1>
            {!isMovie && (
              <p className="text-sm text-muted-foreground">
                Season {selectedSeason} · Episode {selectedEpisode}
              </p>
            )}
          </div>

          {/* Player */}
          <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-xl overflow-hidden mb-6">
            <iframe
              key={`${server}-${selectedSeason}-${selectedEpisode}`}
              src={playerUrl}
              allowFullScreen
              allow="fullscreen; picture-in-picture; autoplay"
              referrerPolicy="no-referrer-when-downgrade"
              title={title}
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Controls */}
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Server Switcher */}
            <div className="hidden">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Server</p>
              <div className="flex flex-wrap gap-2">
                {SERVERS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setServer(s.key)}
                    className={`h-9 px-4 rounded-lg text-xs font-medium transition-colors border ${
                      server === s.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:bg-muted/50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TV Season / Episode Selector */}
            {!isMovie && totalSeasons > 0 && (
              <>
                {/* Season buttons */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Season</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSeasonChange(s)}
                        className={`h-9 w-12 rounded-lg text-xs font-medium transition-colors border ${
                          selectedSeason === s
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:bg-muted/50'
                        }`}
                      >
                        S{s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode buttons */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Episode</p>
                  {seasonLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading episodes...</span>
                    </div>
                  ) : totalEpisodesForSeason > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: totalEpisodesForSeason }, (_, i) => i + 1).map((ep) => (
                        <button
                          key={ep}
                          onClick={() => setSelectedEpisode(ep)}
                          className={`h-9 w-12 rounded-lg text-xs font-medium transition-colors border ${
                            selectedEpisode === ep
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-foreground border-border hover:bg-muted/50'
                          }`}
                          title={seasonDetail?.episodes?.find((e) => e.episode_number === ep)?.name || `Episode ${ep}`}
                        >
                          {ep}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No episodes found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Detail Mode */
        <div className="px-4 md:px-8 -mt-16 md:-mt-28 relative z-10 pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Poster */}
            {posterUrl && (
              <div className="flex-none w-36 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-muted self-start">
                <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2 md:pt-20">
              {/* Type + Year + Runtime */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="secondary" className="text-[10px] uppercase bg-primary/20 text-primary border-0">
                  {isMovie ? <Film className="h-3 w-3 mr-1" /> : <Tv className="h-3 w-3 mr-1" />}
                  {isMovie ? 'Movie' : 'Series'}
                </Badge>
                {year && <span className="text-xs text-muted-foreground">{year}</span>}
                {runtime && <span className="text-xs text-muted-foreground">{runtime}</span>}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-2 text-balance tracking-tight">
                {title}
              </h1>

              {/* Tagline */}
              {item.tagline && (
                <p className="text-sm md:text-base text-muted-foreground italic mb-4">
                  &ldquo;{item.tagline}&rdquo;
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4" fill="currentColor" />
                  <span className="text-base font-semibold">{formatVote(item.vote_average)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  / 10 ({item.vote_count.toLocaleString()} votes)
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((g) => (
                  <Badge key={g.id} variant="outline" className="text-xs px-3 py-1 rounded-full">
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                {item.overview || 'No overview available.'}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg"
                  onClick={() => handleEnterWatchMode()}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
                <Button
                  variant="outline"
                  className={`h-11 px-6 border-border font-medium text-sm rounded-lg ${
                    isFav ? 'text-red-500 border-red-500/50 hover:bg-red-500/10' : 'text-foreground hover:bg-muted/50'
                  }`}
                  onClick={handleToggleFav}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFav ? 'fill-red-500' : ''}`} />
                  {isFav ? 'Saved' : 'Favorite'}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-6 border-border font-medium text-sm rounded-lg text-primary hover:bg-muted/50"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6 max-w-2xl">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-medium">{getStatus()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Language</p>
                  <p className="text-sm font-medium">{getLanguage()}</p>
                </div>
                {getBudget() && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Budget</p>
                    <p className="text-sm font-medium">{getBudget()}</p>
                  </div>
                )}
                {getRevenue() && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Revenue</p>
                    <p className="text-sm font-medium">{getRevenue()}</p>
                  </div>
                )}
              </div>

              {/* Seasons for TV */}
              {!isMovie && (item as TMDBTVShowDetail).seasons && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">
                    {(item as TMDBTVShowDetail).number_of_seasons} Seasons · {(item as TMDBTVShowDetail).number_of_episodes} Episodes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Season & Episode Selector (TV only) */}
          {!isMovie && (item as TMDBTVShowDetail).seasons && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider">
                Episodes
              </h2>

              {/* Season dropdown */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-muted-foreground">Season:</span>
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    className="h-9 pl-3 pr-8 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                  >
                    {(item as TMDBTVShowDetail).seasons
                      ?.filter((s) => s.season_number > 0)
                      .map((s) => (
                        <option key={s.id} value={s.season_number}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Episode list */}
              {seasonLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading episodes...</span>
                </div>
              ) : seasonDetail && seasonDetail.episodes && seasonDetail.episodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {seasonDetail.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setSelectedEpisode(ep.episode_number);
                        handleEnterWatchMode(ep.runtime || undefined);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedEpisode === ep.episode_number
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex-none w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {ep.episode_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ep.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'TBA'}
                          {ep.runtime ? ` · ${ep.runtime} min` : ''}
                        </p>
                      </div>
                      <Play className="h-4 w-4 text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No episodes found for this season.</p>
              )}
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider">
                Cast
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {cast.map((person) => (
                  <div key={person.id} className="flex-none w-20 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mb-2 mx-auto">
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, 'w185')}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate px-0.5">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate px-0.5">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* You May Also Like */}
          {similar.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {similar.map((rec) => {
                  const recTitle = 'title' in rec ? rec.title : rec.name;
                  const recYear = 'release_date' in rec
                    ? (rec.release_date ? new Date(rec.release_date).getFullYear() : '')
                    : (rec.first_air_date ? new Date(rec.first_air_date).getFullYear() : '');
                  const poster = getImageUrl(rec.poster_path, 'w342');
                  return (
                    <Link
                      key={rec.id}
                      to={`/${isMovie ? 'movie' : 'tv'}/${rec.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-2">
                        <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          {isMovie ? 'Film' : 'Series'}
                        </div>
                        {poster && (
                          <img
                            src={poster}
                            alt={recTitle}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{recTitle}</p>
                      <p className="text-[10px] text-muted-foreground">{recYear || 'N/A'}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Detail;
