import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useRoute, Link } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { WatchData, StreamLink, DownloadGroup } from '../types';
import Icon from '../components/Icon';
import AppBar from '../components/AppBar';

const VideoPlayer = ({ streamUrl }: { streamUrl: string }) => (
    <div className="w-full aspect-video bg-black shrink-0">
        {streamUrl ? (
            <iframe
                key={streamUrl}
                src={streamUrl}
                className="w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                title="Video Player"
            ></iframe>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant bg-surface-container gap-4 p-4">
                <Icon name="play_disabled" className="text-7xl" />
                <span className="text-lg">Select a stream to play</span>
            </div>
        )}
    </div>
);

const EpisodeHeader: React.FC<{
    title: string;
    animeSlug: string | undefined;
    prevSlug: string | null;
    nextSlug: string | null;
    hasPrev: boolean;
    hasNext: boolean;
}> = ({ title, animeSlug, prevSlug, nextSlug, hasPrev, hasNext }) => (
    <div className="space-y-5">
        <div>
            <h1 className="text-3xl font-bold leading-tight">{title}</h1>
            {animeSlug && (
                <Link to={`/anime/${animeSlug}`} className="text-primary font-medium hover:underline mt-1 inline-block text-lg">
                    View Anime Details
                </Link>
            )}
        </div>
        <div className="grid grid-cols-3 gap-3">
            <Link
                to={hasPrev && prevSlug ? `/watch/${prevSlug}` : undefined}
                className={`flex items-center justify-center gap-2 h-14 rounded-2xl transition-colors ${!hasPrev ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest'}`}
            >
                <Icon name="skip_previous" className="text-3xl" />
                <span className="font-medium text-lg hidden sm:inline">Prev</span>
            </Link>

            <Link
                to={animeSlug ? `/anime/${animeSlug}?tab=episodes` : undefined}
                className={`flex items-center justify-center h-14 rounded-full transition-colors ${!animeSlug ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'bg-secondary-container text-on-secondary-container hover:opacity-90'}`}
                aria-label="View all episodes"
            >
                <Icon name="list_alt" className="text-3xl" />
            </Link>

            <Link
                to={hasNext && nextSlug ? `/watch/${nextSlug}` : undefined}
                className={`flex items-center justify-center gap-2 h-14 rounded-2xl transition-colors ${!hasNext ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest'}`}
            >
                <span className="font-medium text-lg hidden sm:inline">Next</span>
                <Icon name="skip_next" className="text-3xl" />
            </Link>
        </div>
    </div>
);


const StreamSelection: React.FC<{
    streams: StreamLink[];
    currentStream: StreamLink | null;
    onStreamChange: (stream: StreamLink) => void;
}> = ({ streams, currentStream, onStreamChange }) => {
    
    const groupedStreams = useMemo(() => {
        if (!streams) return {};
        return streams.reduce((acc, stream) => {
            let provider = stream.provider;
            // Unify all 'ondesu' variations under a single provider name
            if (provider.toLowerCase().includes('ondesu')) {
                provider = 'Ondesu';
            }
            if (!acc[provider]) acc[provider] = [];
            acc[provider].push(stream);
            return acc;
        }, {} as Record<string, StreamLink[]>);
    }, [streams]);

    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    // Effect to set initial provider based on the current stream or a default
    useEffect(() => {
        if (currentStream) {
            const providerName = currentStream.provider;
            if (providerName.toLowerCase().includes('ondesu')) {
                setSelectedProvider('Ondesu');
            } else {
                setSelectedProvider(providerName);
            }
        } else if (Object.keys(groupedStreams).length > 0) {
            // Default to 'Ondesu' if available, otherwise the first one
            const ondesuProvider = Object.keys(groupedStreams).find(p => p === 'Ondesu');
            setSelectedProvider(ondesuProvider || Object.keys(groupedStreams)[0]);
        }
    }, [currentStream, groupedStreams]);

    const handleProviderSelect = (provider: string) => {
        setSelectedProvider(provider);
        const qualities = groupedStreams[provider];
        if (qualities && qualities.length > 0) {
             const sortedQualities = [...qualities].sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
             onStreamChange(sortedQualities[0]);
        }
    };
    
    if (!streams || streams.length === 0) {
        return <div className="p-4 text-center text-on-surface-variant text-lg">No streaming sources available.</div>;
    }

    const availableQualities = useMemo(() => {
        if (!selectedProvider) return [];
        const qualitiesForProvider = groupedStreams[selectedProvider] || [];
        
        const uniqueStreams: StreamLink[] = [];
        const seenQualities = new Set<string>();

        const sortedQualities = [...qualitiesForProvider].sort((a, b) => {
            const qualityA = parseInt(a.quality);
            const qualityB = parseInt(b.quality);
            return qualityB - qualityA;
        });

        for (const stream of sortedQualities) {
            if (!seenQualities.has(stream.quality)) {
                uniqueStreams.push(stream);
                seenQualities.add(stream.quality);
            }
        }
        
        return uniqueStreams;
    }, [selectedProvider, groupedStreams]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium mb-3">Server</h2>
                <div className="bg-surface-container rounded-2xl overflow-hidden divide-y divide-outline-variant">
                    {Object.keys(groupedStreams).sort().map((provider) => (
                        <button
                            key={provider}
                            onClick={() => handleProviderSelect(provider)}
                            className={`w-full p-4 text-left text-lg transition-colors flex justify-between items-center ${selectedProvider === provider ? 'bg-secondary-container text-on-secondary-container font-medium' : 'hover:bg-surface-container-high active:bg-surface-container-highest'}`}
                        >
                            <span>{provider}</span>
                            {selectedProvider === provider && <Icon name="check_circle" className="text-2xl" />}
                        </button>
                    ))}
                </div>
            </div>
            {availableQualities.length > 0 && (
                <div>
                    <h2 className="text-xl font-medium mb-3">Resolution</h2>
                    <div className="bg-surface-container rounded-2xl overflow-hidden divide-y divide-outline-variant">
                        {availableQualities.map((stream) => (
                            <button
                                key={stream.url}
                                onClick={() => onStreamChange(stream)}
                                className={`w-full p-4 text-left text-lg transition-colors flex justify-between items-center ${currentStream?.url === stream.url ? 'bg-secondary-container text-on-secondary-container font-medium' : 'hover:bg-surface-container-high active:bg-surface-container-highest'}`}
                            >
                                <span>{stream.quality}</span>
                                {currentStream?.url === stream.url && <Icon name="check_circle" className="text-2xl" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const DownloadSection: React.FC<{ downloadGroups: DownloadGroup[] }> = ({ downloadGroups }) => {
    const [openGroup, setOpenGroup] = useState<string | null>(null);

    if (!downloadGroups || downloadGroups.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-medium">Download Links</h2>
            <div className="bg-surface-container rounded-2xl overflow-hidden">
                {downloadGroups.map((group, groupIndex) => (
                    <div key={group.format_title} className={`${groupIndex > 0 ? 'border-t border-outline-variant' : ''}`}>
                        <button
                            onClick={() => setOpenGroup(prev => prev === group.format_title ? null : group.format_title)}
                            className="w-full p-5 flex justify-between items-center text-left hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-lg"
                            aria-expanded={openGroup === group.format_title}
                        >
                            <span className="font-medium flex-1 mr-2">{group.format_title}</span>
                            <Icon name={openGroup === group.format_title ? 'expand_less' : 'expand_more'} className="transition-transform duration-300 text-3xl" />
                        </button>
                        {openGroup === group.format_title && (
                            <div className="px-5 pb-5 pt-1 space-y-4">
                                {group.formats.map(format => (
                                    <div key={format.resolution} className="bg-surface-container-low rounded-2xl p-4">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-on-surface text-xl">{format.resolution}</p>
                                            <p className="text-md font-medium text-on-surface-variant">{format.size}</p>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {format.links.map(link => (
                                                <a
                                                    key={link.provider}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-medium text-base transition-colors"
                                                >
                                                    <span>{link.provider}</span>
                                                    <Icon name="open_in_new" className="text-xl" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const WatchPageSkeleton = () => (
    <div className="bg-background h-screen flex flex-col animate-pulse">
        <AppBar showBackButton title="" />
        <div className="w-full aspect-video bg-surface-container-high" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="h-9 bg-surface-container-high rounded-lg w-3/4" />
            <div className="h-6 bg-surface-container-high rounded-lg w-1/3" />
            <div className="grid grid-cols-3 gap-3">
                <div className="h-14 bg-surface-container rounded-2xl" />
                <div className="h-14 bg-secondary-container rounded-full" />
                <div className="h-14 bg-surface-container rounded-2xl" />
            </div>
             <div className="h-8 bg-surface-container-high rounded-lg w-1/2 mt-4" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 bg-surface-container-high rounded-2xl" />
                <div className="h-16 bg-surface-container-high rounded-2xl" />
            </div>
        </main>
    </div>
);

const WatchPage: React.FC = () => {
    const [match, params] = useRoute("/watch/:slug");
    const slug = params?.slug;
    const [selectedStream, setSelectedStream] = useState<StreamLink | null>(null);

    const getEpisodeData = useCallback(() => {
        if (!slug) return Promise.reject(new Error('Episode slug is missing in URL.'));
        return api.getEpisode(slug);
    }, [slug]);

    const { data, loading, error, refetch } = useApi<WatchData>(getEpisodeData);

    useEffect(() => {
        setSelectedStream(null);
        if (slug) refetch();
    }, [slug, refetch]);
    
    useEffect(() => {
        if (data?.streamList && data.streamList.length > 0) {
            const ondesuStream = data.streamList.find(s => s.provider.toLowerCase().includes('ondesu'));
            if (ondesuStream) {
                const bestOndesu = data.streamList
                    .filter(s => s.provider.toLowerCase().includes('ondesu'))
                    .sort((a, b) => parseInt(b.quality) - parseInt(a.quality))[0];
                setSelectedStream(bestOndesu);
                return;
            }
            const highQualityStream = data.streamList.find(s => s.quality.includes('720')) || data.streamList.find(s => s.quality.includes('1080'));
            setSelectedStream(highQualityStream || data.streamList[0]);
        } else if (data?.stream_url) {
            setSelectedStream({ quality: 'Default', provider: 'Default', url: data.stream_url });
        }
    }, [data]);

    if (loading) return <WatchPageSkeleton />;

    if (error) {
        return (
            <div className="bg-background h-screen flex flex-col">
                <AppBar showBackButton title="Error" />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-error">
                    <Icon name="error" className="text-7xl" />
                    <p className="mt-4 text-xl">Failed to load episode data.</p>
                    <p className="text-on-surface-variant">{error.message}</p>
                    <button onClick={refetch} className="mt-6 flex items-center gap-2 h-14 px-8 rounded-full bg-primary text-on-primary font-medium text-lg">
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
            <VideoPlayer streamUrl={selectedStream?.url || ''} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8 pb-8">
                    <EpisodeHeader
                        title={data.episode}
                        animeSlug={data.anime?.slug}
                        prevSlug={data.previous_episode_slug}
                        nextSlug={data.next_episode_slug}
                        hasPrev={data.has_previous_episode}
                        hasNext={data.has_next_episode}
                    />
                    <StreamSelection
                        streams={data.streamList}
                        onStreamChange={setSelectedStream}
                        currentStream={selectedStream}
                    />
                    <DownloadSection downloadGroups={data.download_urls} />
                </div>
            </main>
        </div>
    );
};

export default WatchPage;