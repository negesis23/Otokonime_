
import React, { useContext, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Link, useRoute } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { AnimeDetail, Episode, ListStatus, Recommendation } from '../types';
import AppBar from '../components/AppBar';
import Icon from '../components/Icon';
import { MyListContext } from '../contexts/BookmarksContext';
import AddToListSheet from '../components/AddToListSheet';
import { AnimeCard } from '../components/AnimeCard';
import Toast from '../components/Toast';

type Tab = 'about' | 'episodes' | 'recommendations';

const formatStatusLabel = (status: ListStatus | null) => {
    if (!status) return "Add to List";
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getEpisodeLabel = (episode: string): string => {
    const lowerEpisode = episode.toLowerCase();
    let match = episode.match(/(?:episode|ova|special|sp)[\s.-]*(\d+(?:[.-]\d+)?)/i);
    if (match && match[1]) return match[1];
    if (lowerEpisode.includes('ova')) return 'OVA';
    if (lowerEpisode.includes('special') || lowerEpisode.includes('sp')) return 'SP';
    if (lowerEpisode.includes('movie')) return 'MOV';
    const numbers = episode.match(/\d+(?:[.-]\d+)?/g);
    if (numbers) return numbers[numbers.length - 1];
    return '??';
};

// Sub-components for better structure
const DetailHeader: React.FC<{ anime: AnimeDetail }> = ({ anime }) => (
    <div className="relative overflow-hidden">
        {/* Blurred Background */}
        <img src={anime.poster} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125" aria-hidden="true" />
        {/* Scrim for AppBar contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>

        <div className="relative pt-20 p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-end">
            <img src={anime.poster} alt={anime.title} className="w-40 h-56 object-cover rounded-2xl shadow-lg flex-shrink-0" />
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-on-surface">{anime.title}</h1>
                <p className="text-md text-on-surface-variant mt-1">{anime.japanese_title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center sm:justify-start">
                    {anime.rating && <InfoChip icon="star" text={anime.rating} />}
                    {anime.status && <InfoChip icon="schedule" text={anime.status} />}
                    {anime.type && <InfoChip icon="movie" text={anime.type} />}
                </div>
            </div>
        </div>
        <div className="relative flex flex-wrap gap-2 p-6 pt-2 justify-center sm:justify-start">
            {anime.genres?.map(genre => (
                <Link
                    to={`/genre/${genre.slug}`}
                    key={genre.slug}
                    className="px-3 py-1.5 text-sm font-medium bg-surface-container-high text-on-surface-variant rounded-lg hover:bg-surface-container-highest transition-colors"
                >
                    {genre.name}
                </Link>
            ))}
        </div>
    </div>
);

const InfoChip: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-1.5 text-on-surface-variant">
        <Icon name={icon} className="text-xl" />
        <span className="font-medium">{text}</span>
    </div>
);

const DetailInfo: React.FC<{ anime: AnimeDetail }> = ({ anime }) => (
    <div className="px-6 py-4">
        <h2 className="text-xl font-medium mb-2">Synopsis</h2>
        <p className="text-on-surface-variant leading-relaxed text-base">{anime.synopsis}</p>
        
        <h2 className="text-xl font-medium mt-6 mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-on-surface-variant">
            <InfoDetail label="Studio" value={anime.studio} />
            <InfoDetail label="Producer" value={anime.produser} />
            <InfoDetail label="Duration" value={anime.duration} />
            <InfoDetail label="Release Date" value={anime.release_date} />
            <InfoDetail label="Total Episodes" value={anime.episode_count} />
        </div>
    </div>
);

const InfoDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-on-surface">{label}</p>
        <p>{value || 'N/A'}</p>
    </div>
);

const EpisodeList: React.FC<{ episodes: Episode[], batch: AnimeDetail['batch'] }> = ({ episodes, batch }) => {
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');

    const sortedAndFilteredEpisodes = useMemo(() => {
        const filtered = episodes.filter(ep =>
            ep.episode.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (sortOrder === 'asc') {
            return [...filtered].reverse();
        }
        return filtered;
    }, [episodes, searchQuery, sortOrder]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Episodes</h2>
                {batch && (
                    <Link to={`/batch/${batch.slug}`} className="flex items-center gap-2 h-10 px-4 rounded-full bg-tertiary-container text-on-tertiary-container transition-transform active:scale-95">
                        <Icon name="download_for_offline" />
                        <span className="font-medium">Batch</span>
                    </Link>
                )}
            </div>
            
            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                     <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                     <input
                        type="text"
                        placeholder="Filter episodes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-12 bg-surface-container-high rounded-full pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-surface-container-high rounded-full transition-transform active:scale-90"
                    aria-label={`Sort episodes ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                    <Icon name="swap_vert" />
                </button>
            </div>

            <div className="bg-surface-container rounded-2xl overflow-hidden">
                {sortedAndFilteredEpisodes.map((ep, index) => (
                    <React.Fragment key={ep.slug}>
                        <Link href={`/watch/${ep.slug}`} className="block">
                            <div className="p-4 flex items-center gap-4 hover:bg-surface-container-high active:bg-surface-container-highest transition-colors min-h-[5rem]">
                                <div className="w-12 h-12 flex items-center justify-center bg-primary-container text-on-primary-container rounded-xl font-bold text-lg">
                                    {getEpisodeLabel(ep.episode)}
                                </div>
                                <span className="flex-1 text-on-surface-variant text-base">{ep.episode}</span>
                                <Icon name="chevron_right" className="text-2xl" />
                            </div>
                        </Link>
                        {index < sortedAndFilteredEpisodes.length - 1 && <hr className="border-outline-variant ml-20" />}
                    </React.Fragment>
                ))}
                 {sortedAndFilteredEpisodes.length === 0 && (
                    <div className="text-center py-10 px-4">
                        <Icon name="search_off" className="text-5xl text-on-surface-variant" />
                        <p className="mt-2 text-on-surface-variant">No episodes match your filter.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

const Recommendations: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) return null;
    return (
        <section className="p-6">
            <h2 className="text-xl font-medium mb-4">You Might Also Like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {recommendations.map(anime => (
                    <div key={anime.slug} className="w-36 flex-shrink-0">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
        </section>
    );
}

const DetailTabs: React.FC<{ activeTab: Tab, setActiveTab: (tab: Tab) => void }> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: Tab, label: string }[] = [
        { id: 'about', label: 'About' },
        { id: 'episodes', label: 'Episodes' },
        { id: 'recommendations', label: 'Recommendations' },
    ];

    return (
        <div className="border-b border-outline-variant">
            <nav className="flex gap-2 px-4" aria-label="Anime details tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={`py-3 px-3 whitespace-nowrap font-medium text-lg relative transition-colors ${
                            activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};


const DetailPage: React.FC = () => {
    const [match, params] = useRoute("/anime/:slug");
    const slug = params?.slug;
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('about');
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [toastInfo, setToastInfo] = useState<{ message: string; visible: boolean; actionTo?: string }>({ message: '', visible: false, actionTo: undefined });

    useEffect(() => {
        const mainEl = scrollRef.current;
        const handleScroll = () => {
            if (mainEl) {
                // Use a threshold a bit smaller than the app bar height
                setIsScrolled(mainEl.scrollTop > 20); 
            }
        };
        mainEl?.addEventListener('scroll', handleScroll);
        // Initial check in case it's already scrolled
        handleScroll();
        return () => mainEl?.removeEventListener('scroll', handleScroll);
    }, []);

    const getDetails = useCallback(() => {
        if (!slug) return Promise.reject(new Error('Anime slug is missing in URL.'));
        return api.getAnimeDetails(slug);
    }, [slug]);

    const { data, loading, error } = useApi<AnimeDetail>(getDetails);
    const myListContext = useContext(MyListContext);

    const animeData = useMemo(() => {
        if (!data) return null;
        if (!data.slug && slug) return { ...data, slug };
        return data;
    }, [data, slug]);

    const savedItem = animeData ? myListContext?.getItem(animeData.slug) : undefined;
    const currentStatus = savedItem?.list_status || null;
    
    const showToast = (message: string, newStatus?: ListStatus) => {
        setToastInfo({
            message,
            visible: true,
            actionTo: newStatus ? `/my-list?status=${newStatus}` : undefined
        });
        const timer = setTimeout(() => {
            setToastInfo({ message: '', visible: false, actionTo: undefined });
        }, 4000);
    };

    const handleShare = async () => {
        if (!animeData) return;
    
        const shareUrl = `${window.location.origin}/anime/${animeData.slug}`;
    
        if (navigator.share) {
            try {
                await navigator.share({
                    title: animeData.title,
                    text: `Check out ${animeData.title} on Otokonime!`,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                showToast('Link copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy:', error);
                showToast('Failed to copy link.');
            }
        }
    };

    const handleStatusChange = (newStatus: ListStatus) => {
        const statusLabel = formatStatusLabel(newStatus);
        const message = currentStatus === null 
            ? `Added to "${statusLabel}".`
            : `Moved to "${statusLabel}".`;
        showToast(message, newStatus);
    };

    const handleRemove = () => {
        showToast('Removed from your list.');
    };

    const renderTabContent = () => {
        if (!animeData) return null;
        switch (activeTab) {
            case 'about':
                return <DetailInfo anime={animeData} />;
            case 'episodes':
                return <EpisodeList episodes={animeData.episode_lists} batch={animeData.batch} />;
            case 'recommendations':
                return <Recommendations recommendations={animeData.recommendations} />;
            default:
                return null;
        }
    };

    const appBarActions = (
        <button onClick={handleShare} className={`p-3 -mr-3 rounded-full transition-colors ${isScrolled ? 'hover:bg-surface-container active:bg-surface-container-high' : 'hover:bg-white/10 active:bg-white/20'}`}>
            <Icon name="share" />
        </button>
    );


    return (
        <div className="bg-background h-screen">
             <AppBar 
                showBackButton 
                title={isScrolled ? animeData?.title : ''}
                actions={animeData ? appBarActions : undefined}
                className={`fixed top-0 left-0 right-0 mx-auto max-w-screen-sm transition-all duration-300 ${isScrolled ? 'bg-surface-container-low text-on-surface' : 'bg-transparent text-white'}`}
            />
            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto">
                {loading && <DetailSkeleton />}
                {error && <div className="p-4 pt-20 text-error">Error: {error.message}</div>}
                {animeData && (
                    <>
                        <DetailHeader anime={animeData} />
                        <div className="sticky top-0 z-[5] bg-background">
                           <DetailTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                        <div className="pb-24">
                            {renderTabContent()}
                        </div>
                    </>
                )}
            </div>

            {animeData && (
                <button
                    onClick={() => setIsSheetOpen(true)}
                    disabled={myListContext?.isLoading}
                    className="fixed z-20 bottom-6 right-6 flex items-center gap-3 h-14 px-6 rounded-2xl bg-primary-container text-on-primary-container disabled:opacity-50 transition-all shadow-lg active:scale-95 transform-gpu"
                >
                    <Icon name={currentStatus ? "edit" : "add"} />
                    <span className="font-medium text-base">{formatStatusLabel(currentStatus)}</span>
                </button>
            )}

            {toastInfo.visible && (
                <Toast 
                    message={toastInfo.message}
                    action={toastInfo.actionTo ? { text: 'View List', to: toastInfo.actionTo } : undefined}
                />
            )}

            {isSheetOpen && animeData && (
                <AddToListSheet
                    anime={animeData}
                    currentStatus={currentStatus}
                    onClose={() => setIsSheetOpen(false)}
                    onStatusChange={handleStatusChange}
                    onRemove={handleRemove}
                />
            )}
        </div>
    );
};


const DetailSkeleton: React.FC = () => (
    <div className="animate-pulse">
        {/* Header Section Skeleton */}
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-surface-container-high" />
            <div className="relative pt-20 p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-end">
                <div className="w-40 h-56 bg-surface-container-highest rounded-2xl shadow-lg flex-shrink-0" />
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                    <div className="h-9 bg-surface-container-highest rounded w-3/4 mx-auto sm:mx-0" />
                    <div className="h-5 bg-surface-container-highest rounded w-1/2 mt-3 mx-auto sm:mx-0" />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center sm:justify-start">
                        <div className="h-6 w-20 bg-surface-container-highest rounded-full" />
                        <div className="h-6 w-24 bg-surface-container-highest rounded-full" />
                        <div className="h-6 w-16 bg-surface-container-highest rounded-full" />
                    </div>
                </div>
            </div>
            <div className="relative flex flex-wrap gap-2 p-6 pt-2 justify-center sm:justify-start">
                <div className="h-8 w-24 bg-surface-container-highest rounded-lg" />
                <div className="h-8 w-20 bg-surface-container-highest rounded-lg" />
                <div className="h-8 w-28 bg-surface-container-highest rounded-lg" />
            </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-outline-variant">
            <nav className="flex gap-2 px-4">
                 <div className="py-4 px-3 h-14 w-24 bg-transparent">
                    <div className="h-6 bg-surface-container-highest rounded-md w-full" />
                 </div>
                 <div className="py-4 px-3 h-14 w-28 bg-transparent">
                    <div className="h-6 bg-surface-container-highest rounded-md w-full" />
                 </div>
                 <div className="py-4 px-3 h-14 w-40 bg-transparent">
                    <div className="h-6 bg-surface-container-highest rounded-md w-full" />
                 </div>
            </nav>
        </div>

        {/* About Tab Content Skeleton */}
        <div className="px-6 py-4">
            <div className="h-6 w-32 bg-surface-container-highest rounded mb-3" />
            <div className="space-y-2">
                <div className="h-4 bg-surface-container-highest rounded w-full" />
                <div className="h-4 bg-surface-container-highest rounded w-full" />
                <div className="h-4 bg-surface-container-highest rounded w-5/6" />
            </div>
            
            <div className="h-6 w-24 bg-surface-container-highest rounded mt-6 mb-3" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-5 w-1/2 bg-surface-container-highest rounded" />
                        <div className="h-4 w-3/4 bg-surface-container-highest rounded" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export default DetailPage;
