import React, { useContext } from 'react';
import { MyListContext } from '../contexts/BookmarksContext';
import type { ListStatus, MyListItem } from '../types';
import type { AnimeDetail } from '../types';
import Icon from './Icon';

interface AddToListSheetProps {
  anime: AnimeDetail | MyListItem;
  currentStatus: ListStatus | null;
  onClose: () => void;
  onStatusChange: (newStatus: ListStatus) => void;
  onRemove: () => void;
}

const LIST_OPTIONS: { status: ListStatus; label: string; icon: string }[] = [
    { status: 'watching', label: 'Watching', icon: 'visibility' },
    { status: 'plan_to_watch', label: 'Plan to Watch', icon: 'watch_later' },
    { status: 'completed', label: 'Completed', icon: 'done_all' },
    { status: 'on_hold', label: 'On Hold', icon: 'pause_circle' },
    { status: 'dropped', label: 'Dropped', icon: 'delete' },
];

const AddToListSheet: React.FC<AddToListSheetProps> = ({ anime, currentStatus, onClose, onStatusChange, onRemove }) => {
  const myListContext = useContext(MyListContext);

  const handleStatusSelect = async (status: ListStatus) => {
    if (!myListContext) return;
    await myListContext.addToList(anime, status);
    onStatusChange(status);
    onClose();
  };
  
  const handleRemove = async () => {
    if (!myListContext) return;
    await myListContext.removeFromList(anime.slug);
    onRemove();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="absolute inset-0 bg-scrim bg-opacity-50 transition-opacity"></div>
      <div 
        className="relative w-full bg-surface-container-low rounded-t-3xl p-6 pt-4 text-on-surface animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-outline mx-auto rounded-full mb-4"></div>
        <h2 id="dialog-title" className="text-2xl font-medium mb-1 text-center truncate">{anime.title}</h2>
        <p className="text-on-surface-variant text-center mb-6">Add to your list</p>

        <div className="space-y-2">
            {LIST_OPTIONS.map(option => (
                <button 
                    key={option.status}
                    onClick={() => handleStatusSelect(option.status)}
                    className={`w-full flex items-center gap-4 text-left p-4 rounded-xl text-lg transition-colors ${
                        currentStatus === option.status 
                        ? 'bg-primary-container text-on-primary-container' 
                        : 'hover:bg-surface-container-high active:bg-surface-container-highest'
                    }`}
                >
                    <Icon name={option.icon} className={currentStatus === option.status ? 'text-primary' : ''} />
                    <span>{option.label}</span>
                </button>
            ))}
        </div>

        {currentStatus && (
            <>
                <hr className="border-outline-variant my-4" />
                <button
                    onClick={handleRemove}
                    className="w-full flex items-center gap-4 text-left p-4 rounded-xl text-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                >
                    <Icon name="bookmark_remove" />
                    <span>Remove from List</span>
                </button>
            </>
        )}
      </div>
       <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
       `}</style>
    </div>
  );
};

export default AddToListSheet;