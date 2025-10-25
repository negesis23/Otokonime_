
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

    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

    const groupedByQuality = useMemo(() => {
        if (!streams) return {};
        const groups = streams.reduce((acc, stream) => {
            const quality = stream.quality;
            if (!acc[quality]) acc[quality] = [];
            acc[quality].push(stream);
            return acc;
        }, {} as Record<string, StreamLink[]>);

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const numA = parseInt(a.replace('p', ''));
            const numB = parseInt(b.replace('p', ''));
            if (!isNaN(numA) && !isNaN(numB)) {
                return numB - numA; // Sort numerically descending
            }
            return b.localeCompare(a); // Fallback for non-numeric
        });

        const sortedGroups: Record<string, StreamLink[]> = {};
        for (const key of sortedKeys) {
            sortedGroups[key] = groups[key];
        }
        return sortedGroups;
    }, [streams]);

    useEffect(() => {
        if (currentStream) {
            setSelectedQuality(currentStream.quality);
        } else if (Object.keys(groupedByQuality).length > 0) {
            const firstQuality = Object.keys(groupedByQuality)[0];
            setSelectedQuality(firstQuality);
            const firstStream = groupedByQuality[firstQuality][0];
            if (firstStream) {
                onStreamChange(firstStream);
            }
        }
    }, [currentStream, groupedByQuality, onStreamChange]);

    const handleQualitySelect = (quality: string) => {
        setSelectedQuality(quality);
        const firstStreamOfQuality = groupedByQuality[quality]?.[0];
        if (firstStreamOfQuality) {
            onStreamChange(firstStreamOfQuality);
        }
    };

    if (!streams || streams.length === 0) {
        return <div className="p-4 text-center text-on-surface-variant text-lg">No streaming sources available.</div>;
    }

    const availableQualities = Object.keys(groupedByQuality);
    const serversForSelectedQuality = selectedQuality ? groupedByQuality[selectedQuality] : [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-medium mb-4">Select Quality</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {availableQualities.map(quality => (
                        <button
                            key={quality}
                            onClick={() => handleQualitySelect(quality)}
                            className={`py-3 px-5 whitespace-nowrap font-medium text-base rounded-full transition-colors flex-shrink-0 ${
                                selectedQuality === quality
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                        >
                            {quality}
                        </button>
                    ))}
                </div>
            </div>

            {serversForSelectedQuality.length > 0 && (
                <div>
                    <h2 className="text-2xl font-medium mb-4">Select Server</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                        {serversForSelectedQuality.map((stream) => (
                            <button
                                key={`${stream.provider}-${stream.url}`}
                                onClick={() => onStreamChange(stream)}
                                className={`py-3 px-5 whitespace-nowrap font-medium text-base rounded-full transition-colors flex-shrink-0 ${
                                    currentStream?.url === stream.url
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                            >
                                {stream.provider}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const DownloadSection: React.FC<{ downloadGroups: DownloadGroup[] }> = ({ downloadGroups }) => {
    if (!downloadGroups || downloadGroups.length === 0) return null;

    return (
        <div className="space-y-8">
            {downloadGroups.map(group => {
                if (group.formats.length === 0) return null;
                return (
                    <div key={group.format_title}>
                        <h2 className="text-2xl font-medium mb-4 leading-tight">Download {group.format_title}</h2>
                        <div className="bg-surface-container rounded-2xl divide-y divide-outline-variant">
                            {group.formats.map((format, index) => (
                                <div key={`${format.resolution}-${index}`} className="p-4 sm:p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="font-bold text-on-surface text-lg">
                                            {format.resolution}
                                        </p>
                                        <p className="text-sm font-medium text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-md">
                                            {format.size}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {format.links.map(link => (
                                            <a
                                                key={link.provider}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 h-12 px-3 rounded-xl bg-tertiary-container text-on-tertiary-container font-medium text-base transition-all hover:opacity-90 active:scale-95"
                                            >
                                                <span className="truncate">{link.provider}</span>
                                                <Icon name="download" className="text-xl flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const WatchPageSkeleton = () => (
    <div className="bg-background h-screen flex flex-col animate-pulse">
        <AppBar showBackButton title="" />
        <div className="w-full aspect-video bg-surface-container-high" />
        <main className="flex-1 overflow-y-auto p-6 space-y-10">
            {/* Episode Header Skeleton */}
            <div className="space-y-5">
                <div className="h-9 bg-surface-container-high rounded-lg w-3/4" />
                <div className="h-6 bg-surface-container-high rounded-lg w-1/3" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="h-14 bg-surface-container rounded-2xl" />
                    <div className="h-14 bg-secondary-container rounded-full" />
                    <div className="h-14 bg-surface-container rounded-2xl" />
                </div>
            </div>
            {/* Stream Selection Skeleton */}
            <div className="space-y-6">
                 <div>
                    <div className="h-8 bg-surface-container-high rounded-lg w-1/3 mb-4" />
                    <div className="flex gap-3">
                        <div className="h-12 w-24 bg-surface-container-high rounded-full" />
                        <div className="h-12 w-24 bg-surface-container-high rounded-full" />
                        <div className="h-12 w-24 bg-surface-container-high rounded-full" />
                    </div>
                </div>
                 <div>
                    <div className="h-8 bg-surface-container-high rounded-lg w-1/3 mb-4" />
                    <div className="flex gap-3">
                        <div className="h-12 w-28 bg-surface-container-high rounded-full" />
                        <div className="h-12 w-28 bg-surface-container-high rounded-full" />
                    </div>
                </div>
            </div>
            {/* Download Section Skeleton */}
            <div className="space-y-6">
                <div className="h-8 bg-surface-container-high rounded-lg w-2/3 mb-4" />
                <div className="space-y-4">
                    <div className="h-32 bg-surface-container rounded-2xl" />
                    <div className="h-32 bg-surface-container rounded-2xl" />
                </div>
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
        // Reset selected stream when slug changes to avoid showing old video
        setSelectedStream(null); 
    }, [slug]);
    
    // This effect now only runs once when data is loaded
    useEffect(() => {
        if (data?.streamList && data.streamList.length > 0) {
            // Find highest quality stream from any provider
            const sortedByQuality = [...data.streamList].sort((a, b) => {
                const numA = parseInt(a.quality.replace('p', ''));
                const numB = parseInt(b.quality.replace('p', ''));
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numB - numA; // Sort numerically descending
                }
                return b.quality.localeCompare(a.quality); // Fallback for non-numeric
            });
            setSelectedStream(sortedByQuality[0]);
        } else if (data?.stream_url) {
            // Fallback for single stream_url
            setSelectedStream({ quality: 'Default', provider: 'Default', url: data.stream_url });
        }
    }, [data]); // Depend only on `data`

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
                <div className="p-6 space-y-10 pb-8">
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
