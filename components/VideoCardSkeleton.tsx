import React from 'react';

export const VideoCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm relative">
    <div className="h-40 w-full bg-neutral-800 rounded-t-xl" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
      <div className="flex gap-2">
        <div className="h-3 w-10 bg-neutral-700 rounded" />
        <div className="h-3 w-10 bg-neutral-700 rounded" />
      </div>
      <div className="h-3 w-1/2 bg-neutral-700 rounded mt-2" />
    </div>
  </div>
);
