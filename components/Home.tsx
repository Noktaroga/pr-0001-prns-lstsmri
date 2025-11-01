
import React from 'react';
import { Video } from '../types';
import { HeroSlider } from './HeroSlider';
import { VideoCarousel } from './VideoCarousel';
import { CATEGORY_LIST } from '../constants';

interface HomeProps {
    videos: Video[];
    onVideoSelect: (video: Video) => void;
    basketItems: string[];
    onToggleBasketItem: (videoId: string) => void;
    onCategorySelect: (category: string) => void;
}

export const Home: React.FC<HomeProps> = ({ videos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
    // DEBUG: Mostrar categorías y conteo de videos por categoría
    if (typeof window !== 'undefined') {
        const catCount: Record<string, number> = {};
        videos.forEach(v => {
            catCount[v.category] = (catCount[v.category] || 0) + 1;
        });
        // eslint-disable-next-line no-console
        console.log('[DEBUG] Categorías detectadas en videos:', catCount);
    }
    

    // HeroSlider: hasta 1 video top por categoría real, luego rellenar con los más vistos globales
    let featuredVideos: Video[] = [];
    const usedFeaturedIds = new Set<string>();
    // Detectar categorías presentes en los videos actuales
    const categoriesInBackend: string[] = Array.from(new Set(videos.map(v => v.category)));
    categoriesInBackend.forEach(cat => {
        const catVideos = videos.filter(v => v.category === cat);
        if (catVideos.length > 0) {
            const sorted = [...catVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
            if (!usedFeaturedIds.has(sorted[0].id)) {
                featuredVideos.push(sorted[0]);
                usedFeaturedIds.add(sorted[0].id);
            }
        }
    });
    if (featuredVideos.length < 5) {
        const globalSorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
        for (const v of globalSorted) {
            if (featuredVideos.length >= 5) break;
            if (!usedFeaturedIds.has(v.id)) {
                featuredVideos.push(v);
                usedFeaturedIds.add(v.id);
            }
        }
    }
    featuredVideos = featuredVideos.slice(0, 5);

        // Helper para mezclar un array
        function shuffle<T>(array: T[]): T[] {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

    // Detectar categorías presentes en los videos actuales (ya definido arriba)
    const numCategories = categoriesInBackend.length;

        // Helper para seleccionar videos por categoría
        function selectVideosByCategory(sortedVideos: Video[], maxPerCategory: number, maxTotal: number) {
            const result: Video[] = [];
            const usedIds = new Set<string>();
            // Creamos un mapa de categoría a videos
            const catMap: { [key: string]: Video[] } = {};
            categoriesInBackend.forEach((cat: string) => {
                catMap[cat] = sortedVideos.filter(v => v.category === cat && !usedIds.has(v.id));
            });
            // Seleccionamos por rondas: 1er video de cada categoría, luego el 2do, etc.
            let round = 0;
            while (result.length < maxTotal && round < maxPerCategory) {
                for (const cat of categoriesInBackend) {
                    const catVideos = catMap[cat];
                    if (catVideos && catVideos.length > round) {
                        const v = catVideos[round];
                        if (!usedIds.has(v.id)) {
                            result.push(v);
                            usedIds.add(v.id);
                            if (result.length >= maxTotal) break;
                        }
                    }
                }
                round++;
            }
            // Si faltan, rellenar con los globales
            for (const v of sortedVideos) {
                if (result.length >= maxTotal) break;
                if (!usedIds.has(v.id)) {
                    result.push(v);
                    usedIds.add(v.id);
                }
            }
            return result;
        }

        // Most viewed
        const sortedByViews = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
        const maxPerCatMostViewed = numCategories < 9 ? 2 : 1;
        let mostViewedVideos = selectVideosByCategory(sortedByViews, maxPerCatMostViewed, 9);

        // Recommended
        const sortedByRec = [...videos]
            .filter(v => (v.good_votes || 0) > 0 && (v.views || 0) > 0)
            .sort((a, b) => {
                if ((b.good_votes || 0) !== (a.good_votes || 0)) {
                    return (b.good_votes || 0) - (a.good_votes || 0);
                }
                return (a.views || 0) - (b.views || 0);
            });
        const maxPerCatRec = numCategories < 9 ? 2 : 1;
        let recommendedVideos = selectVideosByCategory(sortedByRec, maxPerCatRec, 9);

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