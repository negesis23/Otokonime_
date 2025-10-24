
import React, { useState } from 'react';
import { Link, useLocation } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { HomeData, Anime, Genre } from '../types';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import Icon from '../components/Icon';
import { ThemeContext } from '../contexts/ThemeContext';

const getGenreIcon = (genreName: string): string => {
  switch (genreName.toLowerCase()) {
    case 'action': return 'swords';
    case 'adventure': return 'explore';
    case 'comedy': return 'sentiment_very_satisfied';
    case 'drama': return 'theater_comedy';
    case 'fantasy': return 'auto_awesome';
    case 'magic': return 'magic_button';
    case 'romance': return 'favorite';
    case 'sci-fi': return 'rocket_launch';
    case 'slice of life': return 'bakery_dining';
    case 'sports': return 'sports_soccer';
    case 'supernatural': return 'flare';
    case 'mystery': return 'search';
    case 'horror': return 'skull';
    case 'psychological': return 'psychology';
    case 'thriller': return 'local_fire_department';
    case 'seinen': return 'man';
    case 'shounen': return 'boy';
    case 'shoujo': return 'girl';
    case 'isekai': return 'public';
    case 'school': return 'school';
    case 'super power': return 'bolt';
    case 'military': return 'military_tech';
    case 'harem': return 'groups';
    case 'music': return 'music_note';
    default: return 'movie_filter';
  }
};

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
            <div>
              <h1 className="text-3xl font-bold text-on-surface">Hi, Welcome!</h1>
              <p className="text-lg text-on-surface-variant">What will you watch today?</p>
            </div>
            <button onClick={themeContext?.toggleTheme} className="p-3 rounded-full hover:bg-surface-container-low active:bg-surface-container">
                <Icon name={themeContext?.theme === 'dark' ? 'light_mode' : 'dark_mode'} />
            </button>
        </div>
        <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-3 bg-surface-container-low rounded-full px-5 h-16 w-full text-on-surface-variant focus-within:ring-2 focus-within:ring-primary transition-all">
            <Icon name="search" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What anime are you looking for?"
              className="flex-1 bg-transparent outline-none text-on-surface text-lg"
            />
        </form>
      </header>

      <div className="space-y-8 mt-8">
        <GenreCarousel genres={genres} loading={genresLoading} />
        <AnimeCarousel title="New Episodes" animes={homeData?.ongoing_anime} loading={homeLoading} viewAllLink="/list/ongoing" />
        <AnimeCarousel title="Binge-Watch Now!" animes={homeData?.complete_anime} loading={homeLoading} viewAllLink="/list/complete" />
      </div>
    </div>
  );
};

const GenreCarousel: React.FC<{ genres: Genre[] | null, loading: boolean }> = ({ genres, loading }) => (
    <section className="px-6">
        <h2 className="text-2xl font-medium mb-4">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 animate-pulse h-12 w-32 bg-surface-container-highest rounded-full"></div>
                ))
            ) : (
                genres?.map(genre => (
                    <Link to={`/genre/${genre.slug}`} key={genre.slug} className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-surface-container-high rounded-full text-on-surface-variant font-medium hover:bg-surface-container-highest">
                        <Icon name={getGenreIcon(genre.name)} className="text-xl" />
                        <span>{genre.name}</span>
                    </Link>
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
        Array.isArray(animes) && animes.map(anime => (
          <div key={anime.slug} className="w-40 flex-shrink-0">
            <AnimeCard anime={anime} />
          </div>
        ))
      )}
    </div>
  </section>
);

export default HomePage;