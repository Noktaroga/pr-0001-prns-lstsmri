import React, { useRef, useState, useEffect } from 'react';
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
	
	// Estado para el número de columnas responsivo
	const [responsiveColumns, setResponsiveColumns] = useState(columns);
	
	// Calcular row height responsivo
	const getResponsiveRowHeight = () => {
		const width = window.innerWidth;
		if (width < 640) { // sm breakpoint
			return 280; // Menor altura en móvil
		} else if (width < 768) { // md breakpoint
			return 320;
		} else {
			return rowHeight; // Altura normal en desktop
		}
	};
	
	const [responsiveRowHeight, setResponsiveRowHeight] = useState(rowHeight);

	// Función para calcular columnas basado en el ancho de pantalla
	const getResponsiveColumns = () => {
		const width = window.innerWidth;
		if (width < 640) { // sm breakpoint
			return 2; // Solo 2 columnas en móvil
		} else if (width < 768) { // md breakpoint
			return 3;
		} else if (width < 1024) { // lg breakpoint
			return 4;
		} else if (width < 1536) { // xl breakpoint
			return 5;
		} else {
			return 6; // 6 columnas solo en pantallas muy grandes (2xl+)
		}
	};

	// Efecto para manejar el resize de la ventana
	useEffect(() => {
		const handleResize = () => {
			setResponsiveColumns(getResponsiveColumns());
			setResponsiveRowHeight(getResponsiveRowHeight());
		};

		// Establecer valores iniciales
		setResponsiveColumns(getResponsiveColumns());
		setResponsiveRowHeight(getResponsiveRowHeight());

		// Agregar listener para resize
		window.addEventListener('resize', handleResize);
		
		// Cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, [columns, rowHeight]);

	const rowCount = Math.ceil(videos.length / responsiveColumns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => responsiveRowHeight,
		overscan: 6,
	});

	const height = rowCount * responsiveRowHeight;

	return (
		<div
			ref={parentRef}
			style={{
				minHeight: `${height}px`,
				width: '100%',
				maxWidth: '100%',
				overflow: 'visible',
				position: 'relative',
			}}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					maxWidth: '100%',
					position: 'relative',
				}}
			>
				{rowVirtualizer.getVirtualItems().map(virtualRow => {
					const items = [];
					const startIdx = virtualRow.index * responsiveColumns;
					for (let i = 0; i < responsiveColumns; i++) {
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
								maxWidth: '100%',
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
								display: 'flex',
								gap: '0.75rem', // Menos gap en mobile
								padding: '0 0.75rem', // Menos padding en mobile
								boxSizing: 'border-box',
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
