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

  // Inyectar el script del ad en el div con id específico
  React.useEffect(() => {
    const container = document.getElementById('ad-effectivegatecpm');
    if (container) {
      while (container.firstChild) container.removeChild(container.firstChild);
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//pl28002511.effectivegatecpm.com/57/39/7f/57397f6987af8bed7f4425ed05c24076.js';
      script.async = true;
      container.appendChild(script);
    }
    return () => {
      const container = document.getElementById('ad-effectivegatecpm');
      if (container) while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  return (
    <>
      {/* Banner ad efectivoGateCPM */}
      <div
        id="ad-effectivegatecpm"
        style={{ width: 728, height: 90, margin: '32px auto', background: '#222', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {/* El script se inyecta aquí por useEffect */}
      </div>
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
    </>
  );
};