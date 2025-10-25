
export interface Genre {
  name: string;
  slug: string;
  otakudesu_url: string;
}

export interface Episode {
  episode: string;
  slug: string;
  otakudesu_url: string;
}

export interface Recommendation {
  title: string;
  slug: string;
  poster: string;
  otakudesu_url: string;
}

export interface Anime {
  title: string;
  slug: string;
  poster: string;
  rating?: string;
  genres?: Genre[];
}

export interface OngoingAnime extends Anime {
  current_episode: string;
  release_day: string;
  newest_release_date: string;
}

export interface CompleteAnime extends Anime {
  episode_count: string;
  last_release_date: string;
}

export interface HomeData {
  ongoing_anime: OngoingAnime[];
  complete_anime: CompleteAnime[];
}

export interface AnimeDetail extends Anime {
  japanese_title: string;
  produser: string;
  type: string;
  status: string;
  episode_count: string;
  duration: string;
  release_date: string;
  studio: string;
  synopsis: string;
  batch: {
    slug: string;
    otakudesu_url: string;
    uploaded_at: string;
  } | null;
  episode_lists: Episode[];
  recommendations: Recommendation[];
}

export interface StreamLink {
  quality: string;
  provider: string;
  url: string;
}

export interface DownloadLink {
    provider: string;
    url: string;
}

export interface DownloadFormat {
    resolution: string;
    size: string;
    links: DownloadLink[];
}

export interface DownloadGroup {
    format_title: string;
    formats: DownloadFormat[];
}

export interface WatchData {
  episode: string;
  anime: {
    slug: string;
    otakudesu_url: string;
  };
  has_next_episode: boolean;
  next_episode_slug: string | null;
  has_previous_episode: boolean;
  previous_episode_slug: string | null;
  stream_url: string;
  streamList: StreamLink[];
  download_urls: DownloadGroup[];
}

export interface Pagination {
  current_page: number;
  last_visible_page: number;
  has_next_page: boolean;
  next_page: number | null;
  has_previous_page: boolean;
  previous_page: number | null;
}

export interface PaginatedAnimeResponse<T> {
    data: T[];
    pagination?: Pagination | false;
}

export type ListStatus = 'plan_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped';

export interface MyListItem extends Anime {
  list_status: ListStatus;
  added_at: Date;
  // Add optional properties from other Anime types used by AnimeCard
  current_episode?: string;
  episode_count?: string;
}

export interface DownloadUrl {
  provider: string;
  url: string;
}

export interface BatchDownloadUrl {
  resolution: string;
  file_size: string;
  urls: DownloadUrl[];
}

export interface BatchData {
  batch: string;
  download_urls: BatchDownloadUrl[];
}

export interface ScheduleAnime {
  title: string;
  slug: string;
  otakudesu_url: string;
}

export interface ScheduleData {
  day: string;
  animeList: ScheduleAnime[];
}