import React, { useState } from 'react';
import { Link, useLocation } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { HomeData, Anime, Genre } from '../types';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import Icon from '../components/Icon';
import { ThemeContext } from '../contexts/ThemeContext';

const HomePage: React.FC = () => {
  const { data: homeData, loading: homeLoading, error: homeError } = useApi<HomeData>(api.getHome);
  const { data: genres, loading: genresLoading, error: genresError } = useApi<Genre[]>(api.getGenres);
  const themeContext = React.useContext(ThemeContext);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useLocation();
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const error = homeError || genresError;
  if (error) return <div className="p-4 text-error">Error: {error.message}</div>;

  return (
    <div className="pb-4">
      <header className="px-6 pt-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Otokonime</h1>
            <button onClick={themeContext?.toggleTheme} className="p-3 rounded-full hover:bg-surface-container-low active:bg-surface-container">
                <Icon name={themeContext?.theme === 'dark' ? 'light_mode' : 'dark_mode'} />
            </button>
        </div>
        <form onSubmit={handleSearchSubmit} className="mt-4 flex items-center gap-3 bg-surface-container-low rounded-full px-5 h-16 w-full text-on-surface-variant focus-within:ring-2 focus-within:ring-primary transition-all">
            <Icon name="search" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anime..."
              className="flex-1 bg-transparent outline-none text-on-surface text-lg"
            />
        </form>
      </header>

      <div className="space-y-8 mt-8">
        <GenreCarousel genres={genres} loading={genresLoading} />
        <AnimeCarousel title="Ongoing Anime" animes={homeData?.ongoing_anime} loading={homeLoading} viewAllLink="/list/ongoing" />
        <AnimeCarousel title="Completed Anime" animes={homeData?.complete_anime} loading={homeLoading} viewAllLink="/list/complete" />
      </div>
    </div>
  );
};

const GenreCarousel: React.FC<{ genres: Genre[] | null, loading: boolean }> = ({ genres, loading }) => (
    <section className="px-6">
        <h2 className="text-2xl font-medium mb-4">Genres</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 animate-pulse h-11 w-28 bg-surface-container-highest rounded-full"></div>
                ))
            ) : (
                genres?.map(genre => (
                    <div key={genre.slug} className="flex-shrink-0 px-6 py-2.5 bg-surface-container-high rounded-full text-on-surface-variant font-medium cursor-pointer hover:bg-surface-container-highest">
                        {genre.name}
                    </div>
                ))
            )}
        </div>
    </section>
);

interface AnimeCarouselProps {
  title: string;
  animes: Anime[] | undefined;
  loading: boolean;
  viewAllLink: string;
}

const AnimeCarousel: React.FC<AnimeCarouselProps> = ({ title, animes, loading, viewAllLink }) => (
  <section className="px-6">
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium">{title}</h2>
        <Link href={viewAllLink} className="text-primary font-medium hover:underline">
            View All
        </Link>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="w-40 flex-shrink-0">
            <AnimeCardSkeleton />
          </div>
        ))
      ) : (
        animes?.map(anime => (
          <div key={anime.slug} className="w-40 flex-shrink-0">
            <AnimeCard anime={anime} />
          </div>
        ))
      )}
    </div>
  </section>
);

export default HomePage;