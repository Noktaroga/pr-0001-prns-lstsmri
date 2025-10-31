
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
    // Most viewed: top 9 videos con más visitas, sin importar categoría
    const mostViewedVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 9);
        // Recommended: más likes pero con menos visitas (top 9)
        const recommendedVideos = [...videos]
            .filter(v => (v.good_votes || 0) > 0 && (v.views || 0) > 0)
            .sort((a, b) => {
                // Primero más likes, luego menos visitas
                if ((b.good_votes || 0) !== (a.good_votes || 0)) {
                    return (b.good_votes || 0) - (a.good_votes || 0);
                }
                return (a.views || 0) - (b.views || 0);
            })
            .slice(0, 9);

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
                title="Most viewed" 
                videos={mostViewedVideos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
            <VideoCarousel 
                title="Recommended" 
                videos={recommendedVideos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
        </main>
    );
};