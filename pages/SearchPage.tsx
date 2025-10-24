import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearch } from '../lib/memory-router';
import { api } from '../services/api';
import type { Anime } from '../types';
import { AnimeCard, AnimeCardSkeleton } from '../components/AnimeCard';
import Icon from '../components/Icon';
import AppBar from '../components/AppBar';

const SearchPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const search = useSearch();

  const getQueryFromUrl = useCallback(() => {
    return new URLSearchParams(search).get('q') || '';
  }, [search]);

  const [query, setQuery] = useState(getQueryFromUrl());
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const searchResults = await api.searchAnime(searchQuery);
      setResults(Array.isArray(searchResults) ? searchResults : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryFromUrl = getQueryFromUrl();
    setQuery(queryFromUrl);
    if (queryFromUrl) {
      performSearch(queryFromUrl);
    } else {
      setResults([]);
      setSearched(false);
    }
  }, [getQueryFromUrl, performSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    setLocation(trimmedQuery ? `/search?q=${trimmedQuery}` : '/search');
  };

  const queryFromUrl = getQueryFromUrl();

  return (
    <div>
      <AppBar title="Search" showBackButton />
      <div className="p-4">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3 bg-surface-container-low rounded-full px-5 h-16 w-full text-on-surface-variant focus-within:ring-2 focus-within:ring-primary transition-all">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime..."
            className="flex-1 bg-transparent outline-none text-on-surface text-lg"
          />
        </form>
      </div>

      <div className="px-4 pb-4">
        {loading && (
           <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 10 }).map((_, index) => <AnimeCardSkeleton key={index} />)}
           </div>
        )}
        {error && <div className="text-error">{error}</div>}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {results.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}
        {!loading && searched && results.length === 0 && (
            <div className="text-center py-10">
                <Icon name="search_off" className="text-7xl text-on-surface-variant mx-auto" />
                <p className="mt-4 text-on-surface-variant text-lg">No results found for "{queryFromUrl}"</p>
            </div>
        )}
         {!searched && !loading && results.length === 0 && (
            <div className="text-center py-10">
                <Icon name="movie" className="text-7xl text-on-surface-variant mx-auto" />
                <p className="mt-4 text-on-surface-variant text-lg">Find your next favorite anime.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default SearchPage;