
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Anime, MyListItem, ListStatus } from '../types';
import { myListDB } from '../services/db';

interface MyListContextType {
  myList: MyListItem[];
  addToList: (anime: Anime, status: ListStatus) => Promise<void>;
  removeFromList: (slug: string) => Promise<void>;
  getItem: (slug: string) => MyListItem | undefined;
  isLoading: boolean;
}

export const MyListContext = createContext<MyListContextType | undefined>(undefined);

export const MyListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myList, setMyList] = useState<MyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshList = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await myListDB.getAll();
      setMyList(items.sort((a, b) => b.added_at.getTime() - a.added_at.getTime()));
    } catch (error) {
      console.error('Failed to load list from DB', error);
      setMyList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const addToList = useCallback(async (anime: Anime, status: ListStatus) => {
    await myListDB.addToList(anime, status);
    await refreshList();
  }, [refreshList]);

  const removeFromList = useCallback(async (slug: string) => {
    await myListDB.removeFromList(slug);
    await refreshList();
  }, [refreshList]);

  const getItem = useCallback((slug: string) => {
    return myList.find((item) => item.slug === slug);
  }, [myList]);

  const value = useMemo(() => ({
    myList,
    addToList,
    removeFromList,
    getItem,
    isLoading
  }), [myList, isLoading, addToList, removeFromList, getItem]);

  return (
    <MyListContext.Provider value={value}>
      {children}
    </MyListContext.Provider>
  );
};