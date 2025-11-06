import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Video } from '../../types';
import { VideoCard } from './VideoCard';


interface VirtualizedVideoListProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  basketItems: string[];
  onToggleBasketItem: (videoId: string) => void;
  itemHeight?: number;
}

export const VirtualizedVideoList: React.FC<VirtualizedVideoListProps> = ({
  videos,
  onVideoSelect,
  basketItems,
  onToggleBasketItem,
  itemHeight = 340,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: videos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 6,
  });

  const height = Math.min(videos.length * itemHeight, 960);

  return (
    <div
      ref={parentRef}
      style={{
        height: `${height}px`,
        width: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const video = videos[virtualRow.index];
          return (
            <div
              key={video.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <VideoCard
                video={video}
                onClick={() => onVideoSelect(video)}
                isInBasket={basketItems.includes(video.id)}
                onToggleBasketItem={onToggleBasketItem}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};