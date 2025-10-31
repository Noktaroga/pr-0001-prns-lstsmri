
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

interface VideoCarouselProps {
    title: string;
    videos: Video[];
    onVideoSelect: (video: Video) => void;
    // FIX: basketItems should be an array of strings to match video.id type.
    basketItems: string[];
    // FIX: videoId should be a string to match video.id type.
    onToggleBasketItem: (videoId: string) => void;
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ title, videos, onVideoSelect, basketItems, onToggleBasketItem }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            if (!hasOverflow) {
                setCanScrollLeft(false);
                setCanScrollRight(false);
                return;
            }
            setCanScrollLeft(el.scrollLeft > 0);
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        }
    };

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            checkScrollability();
            el.addEventListener('scroll', checkScrollability);
            window.addEventListener('resize', checkScrollability);
        }
        return () => {
            if (el) {
                el.removeEventListener('scroll', checkScrollability);
                window.removeEventListener('resize', checkScrollability);
            }
        };
    }, [videos]);
    
    const scroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (el) {
            const scrollAmount = el.clientWidth * 0.8;
            el.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Filtro estricto de thumbnails válidos
    const isValidThumbnail = (thumb?: string) => {
        return !!thumb &&
            !thumb.toLowerCase().includes('w3') &&
            !thumb.toLowerCase().includes('placeholder') &&
            !thumb.toLowerCase().includes('default') &&
            thumb.trim() !== '';
    };

    // Filtrar videos con thumbnail válido
    const filteredVideos = videos.filter(v => isValidThumbnail(v.thumbnail));

    if (!filteredVideos || filteredVideos.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-4 px-4 sm:px-6 lg:px-8">{title}</h2>
            <div className="relative group">
                <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-4 scrollbar-hide"
                >
                    <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
                        {filteredVideos.map((video, idx) => (
                            <div key={video.id + '-' + (video.page_url || idx)} className="w-64 sm:w-72 flex-shrink-0">
                                <VideoCard 
                                    video={video} 
                                    onClick={() => onVideoSelect(video)} 
                                    isInBasket={basketItems.includes(video.id)}
                                    onToggleBasketItem={onToggleBasketItem}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {canScrollLeft && (
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-24 bg-black/30 backdrop-blur-sm text-white rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}
                {canScrollRight && (
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-24 bg-black/30 backdrop-blur-sm text-white rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
