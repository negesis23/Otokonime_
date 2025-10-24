
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from '../lib/memory-router';
import { api } from '../services/api';
import type { Anime } from '../types';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import AppBar from '../components/AppBar';

// Helper function to format slug to title
const formatSlugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const GenrePage: React.FC = () => {
  const [match, params] = useRoute("/genre/:slug");
  const genreSlug = params?.slug;

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [status, setStatus] = useState<'loading' | 'loading-more' | 'error' | 'success'>('loading');
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pageToFetch = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchAnimes = useCallback(async (page: number) => {
    if (!genreSlug) return;
    setStatus(page === 1 ? 'loading' : 'loading-more');
    setError(null);

    try {
      const response = await api.getAnimeByGenre(genreSlug, page);
      const newData = Array.isArray(response.data) ? response.data : [];
      setAnimes(prev => (page === 1 ? newData : [...prev, ...newData]));
      
      if (response.pagination) {
        setHasNextPage(response.pagination.has_next_page);
        if (response.pagination.next_page) {
          pageToFetch.current = response.pagination.next_page;
        }
      } else {
        setHasNextPage(false);
      }
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setStatus('error');
    }
  }, [genreSlug]);

  // Effect to fetch initial data or reset when type changes
  useEffect(() => {
    if (!genreSlug) return;
    pageToFetch.current = 1;
    setAnimes([]);
    fetchAnimes(1);
  }, [genreSlug, fetchAnimes]);

  // Effect for the IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && status !== 'loading' && status !== 'loading-more') {
          fetchAnimes(pageToFetch.current);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, status, fetchAnimes]);

  const title = genreSlug ? formatSlugToTitle(genreSlug) : 'Genre';

  if (status === 'loading') {
    return (
      <div>
        <AppBar title={title} showBackButton />
        <div className="p-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 12 }).map((_, index) => <AnimeCardSkeleton key={index} />)}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div>
        <AppBar title={title} showBackButton />
        <div className="p-4 text-error">{error?.message}</div>
      </div>
    );
  }

  return (
    <div>
      <AppBar title={title} showBackButton />
      <div className="p-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {animes.map((anime) => (
            <AnimeCard key={`${anime.slug}-${anime.title}`} anime={anime} />
          ))}
        </div>
        
        {status === 'loading-more' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 2 }).map((_, index) => <AnimeCardSkeleton key={index} />)}
            </div>
        )}

        {/* This is the invisible target for the observer to trigger loading more */}
        <div ref={observerTarget} style={{ height: "20px" }} />

        {!hasNextPage && animes.length > 0 && (
          <div className="text-center pt-6 text-on-surface-variant">
            <p>You've reached the end of the {title} list!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;
