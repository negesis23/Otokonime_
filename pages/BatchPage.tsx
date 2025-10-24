
import React, { useCallback } from 'react';
import { useRoute } from '../lib/memory-router';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { BatchData, BatchDownloadUrl } from '../types';
import AppBar from '../components/AppBar';
import Icon from '../components/Icon';

const BatchPage: React.FC = () => {
  const [match, params] = useRoute("/batch/:slug");
  const slug = params?.slug;

  const getBatchData = useCallback(() => {
    if (!slug) {
      return Promise.reject(new Error('Batch slug is missing in URL.'));
    }
    return api.getBatchLinks(slug);
  }, [slug]);

  const { data, loading, error } = useApi<BatchData>(getBatchData);

  return (
    <div className="bg-background min-h-screen">
      <AppBar title="Batch Download" showBackButton />
      {loading && <BatchSkeleton />}
      {error && <div className="p-4 text-error-container text-center">Error: {error.message}</div>}
      {data && (
        <div className="p-6 pt-0">
          <h1 className="text-2xl font-bold text-on-surface mb-6">{data.batch}</h1>
          <div className="space-y-4">
            {data.download_urls.map((group, index) => (
              <ResolutionGroup key={`${group.resolution}-${index}`} group={group} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ResolutionGroup: React.FC<{ group: BatchDownloadUrl }> = ({ group }) => (
  <div className="bg-surface-container rounded-2xl overflow-hidden">
    <div className="p-4 bg-surface-container-high flex justify-between items-center">
      <h2 className="text-lg font-bold text-on-surface-variant">{group.resolution}</h2>
      <span className="text-sm font-medium text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-md">{group.file_size}</span>
    </div>
    <div className="divide-y divide-outline-variant">
      {group.urls.map((link, index) => (
        <a 
          key={`${link.provider}-${index}`} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 flex justify-between items-center hover:bg-surface-container-high active:bg-surface-container-highest transition-colors"
        >
          <span className="font-medium text-on-surface">{link.provider}</span>
          <Icon name="open_in_new" className="text-on-surface-variant" />
        </a>
      ))}
    </div>
  </div>
);

const BatchSkeleton: React.FC = () => (
    <div className="p-6 pt-0 animate-pulse">
        <div className="h-8 bg-surface-container-highest rounded w-3/4 mb-6" />
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface-container rounded-2xl overflow-hidden">
                    <div className="p-4 bg-surface-container-high flex justify-between items-center">
                        <div className="h-6 bg-surface-container-highest rounded w-1/4" />
                        <div className="h-6 bg-surface-container-highest rounded w-1/5" />
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="h-5 bg-surface-container-highest rounded w-full" />
                        <div className="h-5 bg-surface-container-highest rounded w-full" />
                        <div className="h-5 bg-surface-container-highest rounded w-full" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default BatchPage;
