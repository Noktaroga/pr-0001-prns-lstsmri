import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Video } from '../types';
import { VideoCard } from './VideoCard';

interface VirtualizedVideoGridProps {
	videos: Video[];
	onVideoSelect: (video: Video) => void;
	basketItems: string[];
	onToggleBasketItem: (videoId: string) => void;
	columns?: number;
	rowHeight?: number;
}

export const VirtualizedVideoGrid: React.FC<VirtualizedVideoGridProps> = ({
	videos,
	onVideoSelect,
	basketItems,
	onToggleBasketItem,
	columns = 4,
	rowHeight = 340,
}) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const rowCount = Math.ceil(videos.length / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => rowHeight,
		overscan: 6,
	});

	const height = Math.min(rowCount * rowHeight, 960);

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
					const items = [];
					const startIdx = virtualRow.index * columns;
					for (let i = 0; i < columns; i++) {
						const videoIdx = startIdx + i;
						if (videoIdx >= videos.length) break;
						const video = videos[videoIdx];
						items.push(
							<div key={video.id} style={{ flex: 1, minWidth: 0 }}>
								<VideoCard
									video={video}
									onClick={() => onVideoSelect(video)}
									isInBasket={basketItems.includes(video.id)}
									onToggleBasketItem={onToggleBasketItem}
								/>
							</div>
						);
					}
					return (
						<div
							key={virtualRow.index}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
								display: 'flex',
								gap: '1rem',
								padding: '0 0.5rem',
							}}
						>
							{items}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Este archivo ha sido eliminado porque dependía de react-window, que ya no está instalado ni es compatible.
