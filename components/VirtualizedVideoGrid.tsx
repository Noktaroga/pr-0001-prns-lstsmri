import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Video } from '../types';
import { VideoCard } from './VideoCard';

interface VirtualizedVideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  basketItems: string[];
  onToggleBasketItem: (videoId: string) => void;
  columnCount?: number;
  rowHeight?: number;
}

export const VirtualizedVideoGrid: React.FC<VirtualizedVideoGridProps> = ({
  videos,
  onVideoSelect,
  basketItems,
  onToggleBasketItem,
  columnCount = 4,
  rowHeight = 320,
}) => {
  const rowCount = Math.ceil(videos.length / columnCount);
  const width = 1200; // Ajusta según tu layout
  const height = 960; // Ajusta según tu layout

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={width / columnCount}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={width}
      itemData={{ videos, onVideoSelect, basketItems, onToggleBasketItem, columnCount }}
    >
      {({ columnIndex, rowIndex, style, data }) => {
        const { videos, onVideoSelect, basketItems, onToggleBasketItem, columnCount } = data;
        const index = rowIndex * columnCount + columnIndex;
        if (index >= videos.length) return null;
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
    </Grid>
  );
};
