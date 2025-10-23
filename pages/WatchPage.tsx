
import React, { useCallback } from 'react';
import { useRoute, Link, useHistory } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { WatchData } from '../types';
import Icon from '../components/Icon';

const WatchPage: React.FC = () => {
  const [match, params] = useRoute("/watch/:slug");
  const slug = params?.slug;
  const history = useHistory();

  const getEpisodeData = useCallback(() => {
    if (!slug) {
      return Promise.reject(new Error('Episode slug is missing in URL.'));
    }
    return api.getEpisode(slug);
  }, [slug]);

  const { data, loading, error } = useApi<WatchData>(getEpisodeData);

  return (
    <div className="bg-black h-screen flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center h-16 px-2 bg-gradient-to-b from-black/70 to-transparent text-white">
        <button onClick={history.back} className="p-2 rounded-full hover:bg-white/10">
          <Icon name="arrow_back" />
        </button>
        {loading && <div className="ml-2">Loading...</div>}
        {data && <h1 className="ml-2 truncate">{data.episode}</h1>}
      </header>

      <div className="flex-1 flex items-center justify-center">
        {loading && <div className="text-white">Loading Player...</div>}
        {error && <div className="p-4 text-error-container">Error: {error.message}</div>}
        {data && data.stream_url && (
          <video className="w-full h-auto max-h-full" src={data.stream_url} controls autoPlay>
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      
      {data && (
        <div className="flex justify-between items-center p-4 bg-black/50 text-white">
          {data.has_previous_episode && data.previous_episode ? (
            <Link href={`/watch/${data.previous_episode}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
              <Icon name="skip_previous" />
              <span>Prev</span>
            </Link>
          ) : <div className="w-24"></div>}

          {data.anime?.slug && (
            <Link href={`/anime/${data.anime.slug}`} className="p-2 rounded-full hover:bg-white/10">
                <Icon name="list" />
            </Link>
          )}

          {data.has_next_episode && data.next_episode ? (
            <Link href={`/watch/${data.next_episode}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10">
              <span>Next</span>
              <Icon name="skip_next" />
            </Link>
          ) : <div className="w-24"></div>}
        </div>
      )}
    </div>
  );
};

export default WatchPage;
