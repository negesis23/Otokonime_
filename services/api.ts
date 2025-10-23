
import type { HomeData, AnimeDetail, Anime, WatchData, Genre, OngoingAnime, CompleteAnime, PaginatedAnimeResponse, Pagination } from '../types';

const API_BASE_URL = 'https://kitanime-api.vercel.app/v1';

async function fetcher<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorBody}`);
    }
    const result = await response.json();
    if (result.status !== 'Ok') {
      throw new Error(result.message || 'API returned an error');
    }
    return result.data;
  } catch (error) {
    console.error(`API fetch error from endpoint ${endpoint}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch from ${endpoint}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching from ${endpoint}`);
  }
}


async function fetchPaginated<T>(endpoint: string): Promise<PaginatedAnimeResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorBody}`);
    }
    const result = await response.json();
    if (result.status !== 'Ok') {
      throw new Error(result.message || 'API returned an error');
    }
    return { data: result.data, pagination: result.pagination };
  } catch (error) {
    console.error(`API fetch error from endpoint ${endpoint}:`, error);
     if (error instanceof Error) {
        throw new Error(`Failed to fetch from ${endpoint}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching from ${endpoint}`);
  }
}


export const api = {
  getHome: () => fetcher<HomeData>('/home'),
  getAnimeDetails: (slug: string) => fetcher<AnimeDetail>(`/anime/${slug}`),
  searchAnime: (keyword: string) => fetcher<Anime[]>(`/search/${keyword}`),
  getEpisode: (slug: string) => fetcher<WatchData>(`/episode/${slug}`),
  getGenres: () => fetcher<Genre[]>('/genres'),
  getOngoingAnime: (page = 1) => fetchPaginated<OngoingAnime>(`/ongoing-anime/${page}`),
  getCompleteAnime: (page = 1) => fetchPaginated<CompleteAnime>(`/complete-anime/${page}`),
};
