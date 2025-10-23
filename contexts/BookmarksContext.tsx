
import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Anime } from '../types';

interface BookmarksContextType {
  bookmarks: Anime[];
  addBookmark: (anime: Anime) => void;
  removeBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
}

export const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Anime[]>(() => {
    try {
      const savedBookmarks = localStorage.getItem('bookmarks');
      return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    } catch (error) {
      console.error('Error reading bookmarks from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks to localStorage', error);
    }
  }, [bookmarks]);

  const addBookmark = (anime: Anime) => {
    setBookmarks((prev) => {
      if (!prev.find((b) => b.slug === anime.slug)) {
        return [...prev, anime];
      }
      return prev;
    });
  };

  const removeBookmark = (slug: string) => {
    setBookmarks((prev) => prev.filter((b) => b.slug !== slug));
  };

  const isBookmarked = (slug: string) => {
    return bookmarks.some((b) => b.slug === slug);
  };

  const value = useMemo(() => ({ bookmarks, addBookmark, removeBookmark, isBookmarked }), [bookmarks]);

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
};
