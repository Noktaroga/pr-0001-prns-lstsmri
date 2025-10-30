
import React from 'react';
import { Video } from '../types';
import { HeroSlider } from './HeroSlider';
import { VideoCarousel } from './VideoCarousel';

interface HomeProps {
    videos: Video[];
    onVideoSelect: (video: Video) => void;
    basketItems: string[];
    onToggleBasketItem: (videoId: string) => void;
    onCategorySelect: (category: string) => void;
}

export const Home: React.FC<HomeProps> = ({ videos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
    
    const featuredVideos = videos.slice(0, 5);
    const trendingVideos = [...videos].sort((a, b) => b.views - a.views).slice(5, 14);
    const newReleases = videos.slice(14, 23);

    return (
        <main className="pt-6">
            {featuredVideos.length > 0 && 
                <HeroSlider 
                    videos={featuredVideos} 
                    onVideoSelect={onVideoSelect} 
                    basketItems={basketItems}
                    onToggleBasketItem={onToggleBasketItem}
                    onCategorySelect={onCategorySelect}
                />
            }
            <VideoCarousel 
                title="Trending Now" 
                videos={trendingVideos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
            <VideoCarousel 
                title="New Releases" 
                videos={newReleases} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
        </main>
    );
};