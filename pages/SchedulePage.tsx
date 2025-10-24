
import React from 'react';
import { Link } from '../lib/memory-router';
import AppBar from '../components/AppBar';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import type { ScheduleData } from '../types';

const SchedulePage: React.FC = () => {
  const { data, loading, error } = useApi<ScheduleData[]>(api.getSchedule);

  return (
    <div>
      <AppBar title="Schedule" />
      {loading && <ScheduleSkeleton />}
      {error && <div className="p-4 text-error text-center">{error.message}</div>}
      {data && data.length > 0 ? (
        <div className="p-4 space-y-6">
          {data.map((daySchedule) => (
            <div key={daySchedule.day}>
              <h2 className="text-2xl font-medium text-primary mb-3 px-2">{daySchedule.day}</h2>
              <div className="bg-surface-container rounded-2xl overflow-hidden divide-y divide-outline-variant">
                {daySchedule.animeList.map((anime) => (
                  <Link key={anime.slug} href={`/anime/${anime.slug}`} className="block p-4 hover:bg-surface-container-high active:bg-surface-container-highest transition-colors">
                    <p className="text-lg font-medium text-on-surface">{anime.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && (
            <div className="text-center py-20 px-4">
                <p className="mt-4 text-on-surface-variant text-lg">No schedule data available.</p>
            </div>
        )
      )}
    </div>
  );
};

const ScheduleSkeleton: React.FC = () => (
    <div className="p-4 space-y-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
                <div className="h-8 w-1/3 bg-surface-container-highest rounded mb-3 px-2" />
                <div className="bg-surface-container rounded-2xl p-4 space-y-4">
                    <div className="h-6 bg-surface-container-highest rounded w-full" />
                    <div className="h-6 bg-surface-container-highest rounded w-5/6" />
                    <div className="h-6 bg-surface-container-highest rounded w-full" />
                </div>
            </div>
        ))}
    </div>
);

export default SchedulePage;
