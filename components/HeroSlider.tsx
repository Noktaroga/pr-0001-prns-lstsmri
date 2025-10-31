
import React, { useState } from 'react';
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
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? videos.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === videos.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    const activeVideo = videos[currentIndex];
    const isVideoInBasket = activeVideo && basketItems.includes(activeVideo.id);

    if (!videos || videos.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[60vh] max-h-[500px] flex overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-12">
            {/* Left Panel: Text Content */}
            <div className="w-2/5 flex flex-col justify-center items-start p-8 lg:p-12 relative z-10">
                <div key={currentIndex} className="animate-fadeInUp">

                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-6 line-clamp-3">
                        {activeVideo.title}
                    </h2>
                     <button
                        onClick={() => onToggleBasketItem(activeVideo.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label={isVideoInBasket ? "Remove from basket" : "Add to basket"}
                    >
                        {isVideoInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
                        <span>{isVideoInBasket ? 'In Basket' : 'Add to Basket'}</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 mt-auto">
                    <button onClick={goToPrevious} className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Previous slide">
                        <ChevronLeftIcon />
                    </button>
                    <button onClick={goToNext} className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" aria-label="Next slide">
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            {/* Right Panel: Image Carousel */}
            <div className="w-3/5 h-full relative">
                <div className="w-full h-full">
                    {videos.map((video, index) => (
                        <div
                            key={video.id}
                            className="absolute w-full h-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
                        >
                             <div 
                                className="group w-full h-full cursor-pointer"
                                onClick={() => onVideoSelect(video)}
                            >
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 dark:from-neutral-900 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
