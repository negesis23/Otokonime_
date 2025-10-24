import React, { useCallback, useState, useEffect } from 'react';
import { useRoute, Link } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { WatchData, DownloadResolutionGroup, EpisodeDownloadCollection } from '../types';
import Icon from '../components/Icon';
import AppBar from '../components/AppBar';

const DownloadSection: React.FC<{ downloads: EpisodeDownloadCollection }> = ({ downloads }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Fix: Add Array.isArray check to safely access .length property on `links`
  const downloadFormats = Object.entries(downloads).filter(([, links]) => Array.isArray(links) && links.length > 0);

  if (downloadFormats.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container rounded-2xl mx-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Icon name="download_for_offline" />
          <span className="text-lg font-medium">Download Links</span>
        </div>
        <Icon name={isOpen ? 'expand_less' : 'expand_more'} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {downloadFormats.map(([format, resolutions]) => (
            <div key={format}>
              <h3 className="text-lg font-semibold uppercase text-on-surface-variant mb-2">{format}</h3>
              <div className="space-y-2">
                {(resolutions as DownloadResolutionGroup[]).map((group) => (
                  <div key={group.resolution} className="bg-surface-container-high rounded-lg p-3">
                    <p className="font-bold text-on-surface">{group.resolution}</p>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.urls.map(link => (
                        <a
                          key={link.provider}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 h-10 px-3 rounded-lg bg-surface-container-highest hover:bg-outline/20 text-on-surface-variant font-medium text-sm transition-colors"
                        >
                          <span>{link.provider}</span>
                          <Icon name="open_in_new" className="text-base" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const WatchPage: React.FC = () => {
  const [match, params] = useRoute("/watch/:slug");
  const slug = params?.slug;
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [activeQuality, setActiveQuality] = useState('');

  const getEpisodeData = useCallback(() => {
    if (!slug) {
      return Promise.reject(new Error('Episode slug is missing in URL.'));
    }
    return api.getEpisode(slug);
  }, [slug]);

  const { data, loading, error, refetch } = useApi<WatchData>(getEpisodeData);
  
  useEffect(() => {
    // Refetch data when slug changes (user navigates prev/next)
    refetch();
  }, [slug, refetch]);


  useEffect(() => {
    if (data?.stream_url) {
        const streamBaseUrl = 'https://desustream.com';
        const qualities = Object.keys(data.steramList);
        
        // Determine the default quality and URL
        const defaultQuality = qualities.length > 0 ? qualities[0] : null;
        const defaultUrlPath = defaultQuality ? data.steramList[defaultQuality] : data.stream_url;
        
        const fullUrl = `${streamBaseUrl}${defaultUrlPath}`;
        
        setCurrentStreamUrl(fullUrl);
        if (defaultQuality) {
            setActiveQuality(defaultQuality);
        }
    }
  }, [data]);

  const handleQualityChange = (quality: string, urlPath: string) => {
      const streamBaseUrl = 'https://desustream.com';
      setCurrentStreamUrl(`${streamBaseUrl}${urlPath}`);
      setActiveQuality(quality);
  };
  
  const animeSlug = data?.anime?.slug;
  
  if (loading) {
    return (
        <div className="bg-background h-screen flex flex-col">
            <AppBar showBackButton title="Loading..." />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full aspect-video bg-surface-container-high rounded-xl animate-pulse" />
                <div className="w-full h-20 bg-surface-container-high rounded-xl animate-pulse mt-4" />
                <div className="w-full h-20 bg-surface-container-high rounded-xl animate-pulse mt-4" />
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-background h-screen flex flex-col">
            <AppBar showBackButton title="Error" />
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-error">
                <Icon name="error" className="text-7xl" />
                <p className="mt-4 text-lg">Failed to load episode data.</p>
                <p className="text-on-surface-variant">{error.message}</p>
                <button onClick={refetch} className="mt-6 flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-on-primary font-medium">
                    <Icon name="refresh" />
                    <span>Try Again</span>
                </button>
            </div>
        </div>
    );
  }
  
  if (!data) return null;

  return (
    <div className="bg-background h-screen flex flex-col">
      <AppBar showBackButton title={data.episode} />

      <div className="w-full aspect-video bg-black shrink-0">
        {currentStreamUrl ? (
          <iframe
            key={currentStreamUrl} // Force re-render on URL change
            src={currentStreamUrl}
            className="w-full h-full border-0"
            allowFullScreen
            scrolling="no"
            title="Video Player"
          ></iframe>
        ) : <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No video stream available.</div>}
      </div>
      
      <main className="flex-1 overflow-y-auto pb-6">
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center bg-surface-container p-2 rounded-2xl">
              <Link 
                to={data.has_previous_episode && data.previous_episode ? `/watch/${data.previous_episode}` : undefined}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors ${!data.has_previous_episode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'}`}
                >
                <Icon name="skip_previous" />
                <span className="font-medium hidden sm:inline">Prev</span>
              </Link>
              
              <Link 
                to={animeSlug ? `/anime/${animeSlug}` : undefined} 
                className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors ${!animeSlug ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'}`}
                >
                <Icon name="list" />
                <span className="font-medium hidden sm:inline">Episodes</span>
              </Link>

              <Link 
                to={data.has_next_episode && data.next_episode ? `/watch/${data.next_episode}` : undefined}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-colors ${!data.has_next_episode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'}`}
                >
                <span className="font-medium hidden sm:inline">Next</span>
                <Icon name="skip_next" />
              </Link>
            </div>
            
            {data.steramList && Object.keys(data.steramList).length > 1 && (
                <div className="bg-surface-container rounded-2xl p-4">
                    <h3 className="font-medium mb-3 text-on-surface-variant">Resolutions</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(data.steramList).map(([quality, urlPath]) => (
                            <button
                                key={quality}
                                // Fix: Cast urlPath to string as Object.entries infers it as unknown.
                                onClick={() => handleQualityChange(quality, urlPath as string)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                                    activeQuality === quality
                                        ? 'bg-primary-container text-on-primary-container'
                                        : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                                }`}
                            >
                                {quality}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {data.download_urls && <DownloadSection downloads={data.download_urls} />}
      </main>
    </div>
  );
};

export default WatchPage;