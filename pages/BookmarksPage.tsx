
import React, { useContext } from 'react';
import { BookmarksContext } from '../contexts/BookmarksContext';
import { AnimeCard } from '../components/AnimeCard';
import AppBar from '../components/AppBar';
import Icon from '../components/Icon';

const BookmarksPage: React.FC = () => {
  const bookmarksContext = useContext(BookmarksContext);

  if (!bookmarksContext) {
    return <div>Loading bookmarks...</div>;
  }

  const { bookmarks } = bookmarksContext;

  return (
    <div>
      <AppBar title="Bookmarks" />
      <div className="p-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Icon name="bookmarks" className="text-8xl text-on-surface-variant" />
            <p className="mt-4 text-on-surface-variant text-lg">Your bookmarked anime will appear here.</p>
            <p className="text-md text-outline mt-1">Tap the bookmark icon on an anime's detail page to save it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {bookmarks.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
