
import React from 'react';
import { Link } from '../lib/memory-router';
import type { Anime, OngoingAnime, CompleteAnime } from '../types';
import Icon from './Icon';

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const isOngoing = (a: Anime): a is OngoingAnime => 'current_episode' in a;
  const isComplete = (a: Anime): a is CompleteAnime => 'episode_count' in a;

  let episodeInfo: string | null = null;
  if (isOngoing(anime)) {
    episodeInfo = anime.current_episode.replace('Episode ', 'Ep ');
  } else if (isComplete(anime)) {
    episodeInfo = `${anime.episode_count} Eps`;
  }

  return (
    <Link to={`/anime/${anime.slug}`} className="block group">
      <div className="relative aspect-[2/3] bg-surface-container-high rounded-2xl overflow-hidden transition-transform duration-300">
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" loading="lazy" />
        
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          {anime.rating ? (
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                <Icon name="star" className="text-sm text-yellow-400" />
                <span>{anime.rating}</span>
            </div>
          ) : <div /> /* Empty div to maintain space with flex justify-between */}

          {episodeInfo && (
            <div className="bg-primary text-on-primary text-xs font-semibold px-2 py-1 rounded-full">
              {episodeInfo}
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-base font-medium text-on-surface truncate group-hover:text-primary">
        {anime.title}
      </p>
    </Link>
  );
};

export const AnimeCardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="aspect-[2/3] bg-surface-container-highest rounded-2xl"></div>
            <div className="h-5 bg-surface-container-highest rounded mt-3 w-3/4"></div>
        </div>
    );
}
