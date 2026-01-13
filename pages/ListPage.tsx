import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Anime, PaginatedAnimeResponse, OngoingAnime, CompleteAnime } from '../types';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import AppBar from '../components/AppBar';

type ListType = 'ongoing' | 'complete';

const ListPage: React.FC = () => {
  const { type } = useParams();
  const listType = type as ListType;

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [status, setStatus] = useState<'loading' | 'loading-more' | 'error' | 'success'>('loading');
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pageToFetch = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchAnimes = useCallback(async (page: number) => {
    setStatus(page === 1 ? 'loading' : 'loading-more');
    setError(null);

    try {
      let response: PaginatedAnimeResponse<OngoingAnime | CompleteAnime>;
      if (listType === 'ongoing') {
        response = await api.getOngoingAnime(page);
      } else if (listType === 'complete') {
        response = await api.getCompleteAnime(page);
      } else {
        throw new Error('Invalid list type');
      }

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
  }, [listType]);

  // Effect to fetch initial data or reset when type changes
  useEffect(() => {
    if (!listType) return;
    pageToFetch.current = 1;
    setAnimes([]);
    fetchAnimes(1);
  }, [listType, fetchAnimes]);

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

  const title = listType === 'ongoing' ? 'New Episodes' : 'Binge-Watch Now!';
  const endOfListMessage = listType === 'ongoing' 
      ? "You've seen all the latest episodes!" 
      : "You've explored all completed series!";

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
            <p>{endOfListMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;