import React, { useContext, useState, useMemo } from 'react';
import { Link } from '../lib/memory-router';
import { MyListContext } from '../contexts/BookmarksContext';
import Icon from '../components/Icon';
import type { ListStatus, MyListItem, OngoingAnime, CompleteAnime, AnimeDetail } from '../types';
import AddToListSheet from '../components/AddToListSheet';

const LIST_TABS: { status: ListStatus, label: string }[] = [
    { status: 'watching', label: 'Watching' },
    { status: 'plan_to_watch', label: 'Plan to Watch' },
    { status: 'completed', label: 'Completed' },
    { status: 'on_hold', label: 'On Hold' },
    { status: 'dropped', label: 'Dropped' },
];

// Re-creating the episode info logic locally for MyListItemCard
const getEpisodeInfo = (anime: MyListItem): string | null => {
    const isOngoing = (a: MyListItem): a is MyListItem & OngoingAnime => 'current_episode' in a && a.current_episode !== undefined;
    const isComplete = (a: MyListItem): a is MyListItem & CompleteAnime => 'episode_count' in a && a.episode_count !== undefined;

    if (isOngoing(anime)) {
        const currentEpisode = anime.current_episode;
        if (!currentEpisode) return null;
        const lowerEpisode = currentEpisode.toLowerCase();
        const numbers = currentEpisode.match(/\d+([.-]\d+)?/g);
        const episodeNumber = numbers ? numbers.pop() : null;

        if (episodeNumber) {
            if (lowerEpisode.includes('ova')) return `OVA ${episodeNumber}`;
            if (lowerEpisode.includes('special')) return `SP ${episodeNumber}`;
            return `Episode ${episodeNumber}`;
        }
        if (lowerEpisode.includes('ova')) return 'OVA';
        if (lowerEpisode.includes('special')) return 'Special';
        if (lowerEpisode.includes('movie')) return 'Movie';
        return currentEpisode; // Fallback
    } else if (isComplete(anime)) {
        return `${anime.episode_count} Eps`;
    }
    return null;
};


const MyListItemCard: React.FC<{ anime: MyListItem; onEdit: (anime: MyListItem) => void; }> = ({ anime, onEdit }) => {
    const episodeInfo = getEpisodeInfo(anime);

    return (
        <div className="flex items-center gap-4 p-2 rounded-2xl hover:bg-surface-container-high transition-colors">
            <Link to={`/anime/${anime.slug}`} className="flex-shrink-0">
                <img src={anime.poster} alt={anime.title} className="w-16 h-24 object-cover rounded-lg" />
            </Link>
            <Link to={`/anime/${anime.slug}`} className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">{anime.title}</p>
                {episodeInfo && <p className="text-sm text-on-surface-variant mt-1">{episodeInfo}</p>}
            </Link>
            <button
                onClick={() => onEdit(anime)}
                className="p-3 rounded-full text-on-surface-variant hover:bg-surface-container-highest"
                aria-label={`Edit status for ${anime.title}`}
            >
                <Icon name="more_vert" />
            </button>
        </div>
    );
};


const MyListPage: React.FC = () => {
  const myListContext = useContext(MyListContext);
  const [activeTab, setActiveTab] = useState<ListStatus>('watching');
  const [selectedAnime, setSelectedAnime] = useState<MyListItem | null>(null);

  const groupedList = useMemo(() => {
    if (!myListContext?.myList) return {} as Record<ListStatus, MyListItem[]>;
    return myListContext.myList.reduce((acc, item) => {
        (acc[item.list_status] = acc[item.list_status] || []).push(item);
        return acc;
    }, {} as Record<ListStatus, MyListItem[]>);
  }, [myListContext?.myList]);

  const activeList = groupedList[activeTab] || [];
  
  const handleEdit = (anime: MyListItem) => {
    setSelectedAnime(anime);
  };

  const HeaderTabs = (
    <header className="sticky top-0 z-10 bg-surface-container-low pb-3">
      <div className="flex items-center h-20 px-6">
        <h1 className="text-2xl font-medium truncate flex-1">My List</h1>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 hide-scrollbar">
        {LIST_TABS.map(tab => {
          const isActive = activeTab === tab.status;
          const count = groupedList[tab.status]?.length || 0;
          return (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`py-2 px-4 whitespace-nowrap font-medium text-base rounded-lg transition-colors ${
                isActive 
                  ? 'bg-secondary-container text-on-secondary-container' 
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {tab.label} ({count})
            </button>
          )
        })}
      </div>
    </header>
  );

  if (myListContext?.isLoading) {
    return (
        <div>
            {HeaderTabs}
            <div className="p-4 text-center">Loading your list...</div>
        </div>
    );
  }

  if (!myListContext || myListContext.myList.length === 0) {
    return (
      <div>
        {HeaderTabs}
        <div className="text-center py-20 px-4 flex flex-col items-center">
          <Icon name="video_library" className="text-8xl text-on-surface-variant" />
          <p className="mt-4 text-on-surface-variant text-xl font-medium">Your list is empty.</p>
          <p className="text-md text-outline mt-1 max-w-xs">Add anime to your list and they will appear here.</p>
          <Link to="/" className="mt-6 flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-on-primary font-medium transition-transform active:scale-95">
             <Icon name="add" />
             <span>Discover Anime</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {HeaderTabs}
      <div className="p-4">
        {activeList.length > 0 ? (
          <div className="flex flex-col gap-2">
            {activeList.map((anime) => (
              <MyListItemCard key={anime.slug} anime={anime} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
           <div className="text-center pt-20 pb-10 px-4">
             <Icon name="movie_off" className="text-8xl text-on-surface-variant" />
             <p className="mt-4 text-on-surface-variant text-lg">No anime in this list yet.</p>
          </div>
        )}
      </div>

      {selectedAnime && (
        <AddToListSheet
            anime={selectedAnime as AnimeDetail} // Casting because sheet expects AnimeDetail, but MyListItem has all necessary props for this context
            currentStatus={selectedAnime.list_status}
            onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};

export default MyListPage;