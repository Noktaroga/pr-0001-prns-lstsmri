
import React, { useState, useEffect } from 'react';
import DICTIONARY_ES from '../dictionaries/dictionary-es';
import { Video } from '../types';

interface HeroSliderProps {
    videos: Video[];
    onVideoSelect: (video: Video) => void;
    // FIX: basketItems should be an array of strings to match video.id type.
    basketItems: string[];
    // FIX: videoId should be a string to match video.id type.
    onToggleBasketItem: (videoId: string) => void;
    onCategorySelect: (category: string) => void;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const BasketAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <path d="M18 10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <path d="M14 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12"></path>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const BasketCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M6 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <path d="M18 10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <path d="M14 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12"></path>
        <polyline points="8 12 11 15 16 10"></polyline>
    </svg>
);


export const HeroSlider: React.FC<HeroSliderProps> = ({ videos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
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

    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Estados para el manejo táctil
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Distancia mínima de deslizamiento
    const minSwipeDistance = 50;

    // Ajustar el índice si cambia la lista de videos filtrados
    useEffect(() => {
        if (currentIndex >= filteredVideos.length) {
            setCurrentIndex(0);
        }
    }, [filteredVideos.length]);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? filteredVideos.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === filteredVideos.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    // Funciones para el manejo táctil
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };
    
    const activeVideo = filteredVideos[currentIndex];
    const isVideoInBasket = activeVideo && basketItems.includes(activeVideo.id);

    if (!filteredVideos || filteredVideos.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-auto sm:h-[100vh] max-h-none sm:max-h-[800px] flex flex-col sm:flex-row overflow-hidden bg-neutral-900 mb-12">
            {/* Desktop: Left Panel Text Content */}
            <div className="hidden sm:flex sm:w-2/5 flex-col justify-center items-start p-8 lg:p-12 relative z-10">
                <div key={currentIndex} className="animate-fadeInUp">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-100 mb-6 line-clamp-3">
                        {activeVideo.title}
                    </h2>
                     <button
                        onClick={() => onToggleBasketItem(activeVideo.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
                        aria-label={isVideoInBasket ? "Remove from basket" : "Add to basket"}
                    >
                        {isVideoInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
                        <span>{isVideoInBasket ? 'In Basket' : 'Add to Basket'}</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                    <button onClick={goToPrevious} className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-700 text-white shadow-xl hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200 hover:scale-110" aria-label="Previous slide">
                        <ChevronLeftIcon />
                    </button>
                    <button onClick={goToNext} className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-700 text-white shadow-xl hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200 hover:scale-110" aria-label="Next slide">
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            {/* Mobile: Title above image */}
            <div className="sm:hidden p-4 relative z-10">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-100 mb-4 line-clamp-2">
                    {activeVideo.title}
                </h2>
            </div>

            {/* Image Carousel Container */}
            <div 
                className="w-full sm:w-3/5 h-64 sm:h-full relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="w-full h-full">
                    {filteredVideos.map((video, index) => (
                        <div
                            key={video.id + '-' + (video.page_url || index)}
                            className="absolute w-full h-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
                        >
                             <div 
                                className="group w-full h-full cursor-pointer relative"
                                onClick={() => onVideoSelect(video)}
                            >
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-transparent to-transparent"></div>
                                
                                {/* Mobile Navigation Buttons - Inside Image */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPrevious();
                                    }}
                                    className="sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white shadow-xl hover:bg-black/80 transition-all duration-200"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeftIcon />
                                </button>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToNext();
                                    }}
                                    className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white shadow-xl hover:bg-black/80 transition-all duration-200"
                                    aria-label="Next slide"
                                >
                                    <ChevronRightIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Mobile Add to Basket Button - Centered at Bottom */}
                <button
                    onClick={() => onToggleBasketItem(activeVideo.id)}
                    className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm px-4 py-2 text-sm font-medium hover:bg-neutral-800/80 transition-colors"
                    aria-label={isVideoInBasket ? "Remove from basket" : "Add to basket"}
                >
                    {isVideoInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
                    <span>{isVideoInBasket ? 'In Basket' : 'Add to Basket'}</span>
                </button>
            </div>
        </div>
    );
};
