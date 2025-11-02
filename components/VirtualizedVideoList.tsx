import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Video } from '../types';
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
  const height = Math.min(videos.length * itemHeight, 960);

  return (
    <List
      height={height}
      itemCount={videos.length}
      itemSize={itemHeight}
      width={1200}
    >
      {({ index, style }) => {
        const video = videos[index];
        return (
          <div style={style} key={video.id}>
            <VideoCard
              video={video}
              onClick={() => onVideoSelect(video)}
              isInBasket={basketItems.includes(video.id)}
              onToggleBasketItem={onToggleBasketItem}
            />
          </div>
        );
      }}
    </List>
  );
};