import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Link, useSearch } from '../lib/memory-router';
import { MyListContext } from '../contexts/BookmarksContext';
import Icon from '../components/Icon';
import type { ListStatus, MyListItem } from '../types';
import AddToListSheet from '../components/AddToListSheet';
import Toast from '../components/Toast';

const LIST_TABS: { status: ListStatus, label: string }[] = [
    { status: 'watching', label: 'Watching' },
    { status: 'plan_to_watch', label: 'Plan to Watch' },
    { status: 'completed', label: 'Completed' },
    { status: 'on_hold', label: 'On Hold' },
    { status: 'dropped', label: 'Dropped' },
];

const formatStatusLabel = (status: ListStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const MyListGridCard: React.FC<{ anime: MyListItem; onEdit: (anime: MyListItem) => void; }> = ({ anime, onEdit }) => {
  return (
    <div className="group">
      <div className="relative">
        <Link to={`/anime/${anime.slug}`}>
          <div className="aspect-[2/3] bg-surface-container-high rounded-2xl overflow-hidden transition-transform duration-300">
            <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </Link>
        <button
          onClick={() => onEdit(anime)}
          className="absolute top-2 right-2 p-2 rounded-full bg-surface-container-highest shadow-md text-on-surface hover:bg-surface-container-high active:scale-90 transition-all"
          aria-label={`Edit status for ${anime.title}`}
        >
          <Icon name="more_vert" />
        </button>
      </div>
      <Link to={`/anime/${anime.slug}`}>
        <p className="mt-3 text-base font-medium text-on-surface truncate group-hover:text-primary">
          {anime.title}
        </p>
      </Link>
    </div>
  );
};


const MyListPage: React.FC = () => {
  const myListContext = useContext(MyListContext);
  const search = useSearch();

  const [activeTab, setActiveTab] = useState<ListStatus>('watching');
  const [selectedAnime, setSelectedAnime] = useState<MyListItem | null>(null);
  const [toastInfo, setToastInfo] = useState<{ message: string; visible: boolean; actionTo?: string }>({ message: '', visible: false, actionTo: undefined });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const statusFromUrl = params.get('status') as ListStatus;
    if (statusFromUrl && LIST_TABS.some(tab => tab.status === statusFromUrl)) {
      setActiveTab(statusFromUrl);
    }
  }, [search]);

  const groupedList = useMemo(() => {
    if (!myListContext?.myList) return {} as Record<ListStatus, MyListItem[]>;
    return myListContext.myList.reduce((acc, item) => {
        (acc[item.list_status] = acc[item.list_status] || []).push(item);
        return acc;
    }, {} as Record<ListStatus, MyListItem[]>);
  }, [myListContext?.myList]);

  const activeList = groupedList[activeTab] || [];

  const showToast = (message: string, newStatus?: ListStatus) => {
    setToastInfo({
        message,
        visible: true,
        actionTo: newStatus ? `/my-list?status=${newStatus}` : undefined
    });
    setTimeout(() => {
        setToastInfo({ message: '', visible: false, actionTo: undefined });
    }, 4000);
  };
  
  const handleEdit = (anime: MyListItem) => {
    setSelectedAnime(anime);
  };
  
  const handleStatusChange = (newStatus: ListStatus) => {
    showToast(`Moved to "${formatStatusLabel(newStatus)}".`, newStatus);
  };

  const handleRemove = () => {
    showToast('Removed from your list.');
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {activeList.map((anime) => (
              <MyListGridCard key={anime.slug} anime={anime} onEdit={handleEdit} />
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
            anime={selectedAnime}
            currentStatus={selectedAnime.list_status}
            onClose={() => setSelectedAnime(null)}
            onStatusChange={handleStatusChange}
            onRemove={handleRemove}
        />
      )}
      
      {toastInfo.visible && (
          <Toast
              message={toastInfo.message}
              action={toastInfo.actionTo ? { text: 'View List', to: toastInfo.actionTo } : undefined}
          />
      )}
    </div>
  );
};

export default MyListPage;