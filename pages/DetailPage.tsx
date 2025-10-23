import React, { useContext, useCallback } from 'react';
import { Link, useRoute } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { AnimeDetail, Episode } from '../types';
import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import { BookmarksContext } from '../contexts/BookmarksContext';

const DetailPage: React.FC = () => {
  const [match, params] = useRoute("/anime/:slug");
  const slug = params?.slug;

  const getDetails = useCallback(() => {
    if (!slug) {
      return Promise.reject(new Error('Anime slug is missing in URL.'));
    }
    return api.getAnimeDetails(slug);
  }, [slug]);

  const { data, loading, error } = useApi<AnimeDetail>(getDetails);
  const bookmarksContext = useContext(BookmarksContext);

  const handleBookmarkToggle = () => {
    if (!data || !bookmarksContext) return;
    if (bookmarksContext.isBookmarked(data.slug)) {
      bookmarksContext.removeBookmark(data.slug);
    } else {
      bookmarksContext.addBookmark({ title: data.title, slug: data.slug, poster: data.poster });
    }
  };
  
  const isBookmarked = data ? bookmarksContext?.isBookmarked(data.slug) : false;

  const actions = (
    <button onClick={handleBookmarkToggle} className="p-3 rounded-full hover:bg-surface-container active:bg-surface-container-high">
      <Icon name="bookmark" className={isBookmarked ? 'text-primary' : 'text-on-surface-variant'} />
    </button>
  );

  return (
    <div>
      <AppBar showBackButton actions={actions} />
      {loading && <DetailSkeleton />}
      {error && <div className="p-4 text-error">Error: {error.message}</div>}
      {data && (
        <>
          <header className="p-6 flex flex-col md:flex-row gap-5 items-start">
            <img src={data.poster} alt={data.title} className="w-36 h-52 object-cover rounded-2xl shadow-md flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-on-surface">{data.title}</h1>
              <p className="text-md text-on-surface-variant mt-1">{data.japanese_title}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {data.genres?.map(genre => (
                  <div key={genre.slug} className="px-4 py-1.5 text-base bg-secondary-container text-on-secondary-container rounded-full">
                    {genre.name}
                  </div>
                ))}
              </div>
            </div>
          </header>
          <div className="px-6 pb-4">
            <p className="text-on-surface-variant leading-relaxed text-lg">{data.synopsis}</p>
          </div>
          <EpisodeList episodes={data.episode_lists} />
        </>
      )}
    </div>
  );
};

const EpisodeList: React.FC<{ episodes: Episode[] }> = ({ episodes }) => (
  <div className="p-6">
    <h2 className="text-xl font-medium mb-3">Episodes</h2>
    <div className="bg-surface-container rounded-2xl overflow-hidden">
      {episodes.map((ep, index) => (
        <Link key={ep.slug} href={`/watch/${ep.slug}`} className="block">
          <div className="p-4 flex items-center gap-4 hover:bg-surface-container-high active:bg-surface-container-highest transition-colors min-h-[5.5rem]">
            <div className="w-12 h-12 flex items-center justify-center bg-primary-container text-on-primary-container rounded-xl font-bold text-lg">
              {ep.episode.match(/\d+/)?.[0] || '??'}
            </div>
            <span className="flex-1 text-on-surface-variant text-lg">{ep.episode}</span>
            <Icon name="chevron_right" className="text-2xl" />
          </div>
          {index < episodes.length - 1 && <hr className="border-outline-variant ml-20" />}
        </Link>
      ))}
    </div>
  </div>
);


const DetailSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <header className="p-6 flex gap-5 items-start">
            <div className="w-36 h-52 bg-surface-container-highest rounded-2xl flex-shrink-0"></div>
            <div className="flex-1 mt-2">
                <div className="h-9 bg-surface-container-highest rounded w-3/4"></div>
                <div className="h-5 bg-surface-container-highest rounded w-1/2 mt-3"></div>
                <div className="flex gap-2 mt-4">
                    <div className="h-8 w-24 bg-surface-container-highest rounded-full"></div>
                    <div className="h-8 w-28 bg-surface-container-highest rounded-full"></div>
                </div>
            </div>
        </header>
        <div className="px-6 pb-4 space-y-3">
            <div className="h-5 bg-surface-container-highest rounded w-full"></div>
            <div className="h-5 bg-surface-container-highest rounded w-full"></div>
            <div className="h-5 bg-surface-container-highest rounded w-5/6"></div>
        </div>
        <div className="p-6">
             <div className="h-8 bg-surface-container-highest rounded w-1/3 mb-4"></div>
             <div className="bg-surface-container rounded-2xl p-4 space-y-4">
                <div className="h-14 bg-surface-container-highest rounded-lg"></div>
                <div className="h-14 bg-surface-container-highest rounded-lg"></div>
                <div className="h-14 bg-surface-container-highest rounded-lg"></div>
             </div>
        </div>
    </div>
);

export default DetailPage;