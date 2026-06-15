import type {
  TMDBResponse,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetail,
  TMDBTVShowDetail,
  TMDBSeasonDetail,
  TMDBWatchProvidersResponse,
  TMDBGenre,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '9b362f10e0304f62282c9610e7c5ab52';

async function tmdbRequest<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const searchParams = new URLSearchParams(params || {});
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    const separator = fullPath.includes('?') ? '&' : '?';
    const url = `${TMDB_BASE_URL}${fullPath}${separator}api_key=${API_KEY}`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`TMDB API warning: ${response.status} for ${path}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.warn('TMDB fetch error:', err);
    return null;
  }
}

function emptyMovieResponse(): TMDBResponse<TMDBMovie> {
  return { page: 1, results: [], total_pages: 0, total_results: 0 };
}

function emptyTVResponse(): TMDBResponse<TMDBTVShow> {
  return { page: 1, results: [], total_pages: 0, total_results: 0 };
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  const data = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`/trending/${type}/${timeWindow}`);
  return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
}

export async function getPopularMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>('/movie/popular', { page })) ?? emptyMovieResponse();
}

export async function getTopRatedMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>('/movie/top_rated', { page })) ?? emptyMovieResponse();
}

export async function getNowPlayingMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>('/movie/now_playing', { page })) ?? emptyMovieResponse();
}

export async function getUpcomingMovies(page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>('/movie/upcoming', { page })) ?? emptyMovieResponse();
}

export async function getPopularTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return (await tmdbRequest<TMDBResponse<TMDBTVShow>>('/tv/popular', { page })) ?? emptyTVResponse();
}

export async function getTopRatedTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return (await tmdbRequest<TMDBResponse<TMDBTVShow>>('/tv/top_rated', { page })) ?? emptyTVResponse();
}

export async function getOnAirTVShows(page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return (await tmdbRequest<TMDBResponse<TMDBTVShow>>('/tv/on_the_air', { page })) ?? emptyTVResponse();
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetail | null> {
  return await tmdbRequest<TMDBMovieDetail>(`/movie/${id}`, {
    append_to_response: 'videos,credits',
  });
}

export async function getTVShowDetails(id: number): Promise<TMDBTVShowDetail | null> {
  return await tmdbRequest<TMDBTVShowDetail>(`/tv/${id}`, {
    append_to_response: 'videos,credits',
  });
}

export async function searchMulti(query: string, page = '1'): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  const data = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>('/search/multi', { query, page, include_adult: 'false' });
  return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
}

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  const data = await tmdbRequest<{ genres: TMDBGenre[] }>('/genre/movie/list');
  return data ?? { genres: [] };
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  const data = await tmdbRequest<{ genres: TMDBGenre[] }>('/genre/tv/list');
  return data ?? { genres: [] };
}

export async function discoverMovies(params: Record<string, string> = {}): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>('/discover/movie', params)) ?? emptyMovieResponse();
}

export async function discoverTVShows(params: Record<string, string> = {}): Promise<TMDBResponse<TMDBTVShow>> {
  return (await tmdbRequest<TMDBResponse<TMDBTVShow>>('/discover/tv', params)) ?? emptyTVResponse();
}

export async function getMovieRecommendations(id: number, page = '1'): Promise<TMDBResponse<TMDBMovie>> {
  return (await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/${id}/recommendations`, { page })) ?? emptyMovieResponse();
}

export async function getTVRecommendations(id: number, page = '1'): Promise<TMDBResponse<TMDBTVShow>> {
  return (await tmdbRequest<TMDBResponse<TMDBTVShow>>(`/tv/${id}/recommendations`, { page })) ?? emptyTVResponse();
}

export async function getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetail | null> {
  return await tmdbRequest<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getMovieWatchProviders(id: number): Promise<TMDBWatchProvidersResponse | null> {
  return await tmdbRequest<TMDBWatchProvidersResponse>(`/movie/${id}/watch/providers`);
}

export async function getTVWatchProviders(id: number): Promise<TMDBWatchProvidersResponse | null> {
  return await tmdbRequest<TMDBWatchProvidersResponse>(`/tv/${id}/watch/providers`);
}

export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/original${path}`;
}

export function getTrailerKey(videos?: { results: { key: string; site: string; type: string }[] }): string | null {
  if (!videos?.results?.length) return null;
  const trailer = videos.results.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  if (trailer) return trailer.key;
  const anyVideo = videos.results.find((v) => v.site === 'YouTube');
  return anyVideo?.key || null;
}

export function formatYear(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatVote(vote: number): string {
  return vote ? vote.toFixed(1) : 'N/A';
}
