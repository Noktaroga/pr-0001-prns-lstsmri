
import React, { useEffect, useState } from 'react';
import { Video } from '../../types';
import JuicyAdsHorizontal from '../ads/JuicyAdsHorizontal';
import { CATEGORY_LIST, fetchDiverseVideosForHome } from '../../constants';
import { HeroSlider } from '../video/HeroSlider';
import { VideoCarousel } from '../video/VideoCarousel';
import { VideoCardSkeleton } from '../video/VideoCardSkeleton';

interface HomeProps {
    videos: Video[]; // Mantenemos esta prop pero la usaremos como fallback
    onVideoSelect: (video: Video) => void;
    basketItems: string[];
    onToggleBasketItem: (videoId: string) => void;
    onCategorySelect: (category: string) => void;
}

export const Home: React.FC<HomeProps> = ({ videos: fallbackVideos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
    const [diverseVideos, setDiverseVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [isLoadingInProgress, setIsLoadingInProgress] = useState(false); // Evitar llamadas múltiples
    
    // Función para cargar videos diversos
    const loadDiverseVideos = async (isRefresh = false) => {
        // Evitar múltiples llamadas simultáneas
        if (isLoadingInProgress) {
            return;
        }
        
        try {
            setIsLoadingInProgress(true);
            
            if (isRefresh) {
                setRefreshing(true);
            } else {
                if (hasLoadedOnce) {
                    return; // Evitar cargas múltiples
                }
                setLoading(false);
            }
            
            const { videos: newVideos } = await fetchDiverseVideosForHome();
            
            // Solo actualizar si obtuvimos videos válidos
            if (newVideos.length > 10) {
                setDiverseVideos(newVideos);
                setHasLoadedOnce(true);
            } else {
                if (fallbackVideos.length > 0) {
                    setDiverseVideos(fallbackVideos);
                    setHasLoadedOnce(true);
                }
            }
            
        } catch (error) {
            console.error('[ERROR] Error al cargar videos:', error);
            if (fallbackVideos.length > 0) {
                setDiverseVideos(fallbackVideos);
                setHasLoadedOnce(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingInProgress(false);
        }
    };
    
    // Cargar videos diversos solo al montar
    useEffect(() => {
        if (!hasLoadedOnce) {
            loadDiverseVideos();
        }
    }, []); // Sin dependencias para evitar bucle infinito
    
    // Usar videos diversos si están disponibles, sino usar fallback
    const videos = diverseVideos.length > 0 ? diverseVideos : fallbackVideos;
    
    // Helper para mezclar un array
    function shuffle<T>(array: T[]): T[] {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Helper para seleccionar videos diversos sin repetir IDs entre secciones
    function selectDiverseVideos(
        availableVideos: Video[], 
        usedIds: Set<string>, 
        count: number,
        priorityFn?: (a: Video, b: Video) => number
    ): Video[] {
        // Filtrar videos no usados
        const unusedVideos = availableVideos.filter(v => !usedIds.has(v.id));
        
        if (unusedVideos.length === 0) return [];
        
        // Aplicar función de prioridad si se proporciona
        let sortedVideos = unusedVideos;
        if (priorityFn) {
            sortedVideos = [...unusedVideos].sort(priorityFn);
        }
        
        // Agrupar por categoría para asegurar diversidad
        const videosByCategory: { [key: string]: Video[] } = {};
        sortedVideos.forEach(video => {
            if (!videosByCategory[video.category]) {
                videosByCategory[video.category] = [];
            }
            videosByCategory[video.category].push(video);
        });
        
        // Obtener categorías disponibles y mezclarlas
        const availableCategories = shuffle(Object.keys(videosByCategory));
        
        const result: Video[] = [];
        let categoryIndex = 0;
        let roundIndex = 0;
        
        // Seleccionar videos alternando categorías para máxima diversidad
        while (result.length < count && availableCategories.length > 0) {
            const category = availableCategories[categoryIndex % availableCategories.length];
            const categoryVideos = videosByCategory[category];
            
            if (categoryVideos && categoryVideos.length > roundIndex) {
                const video = categoryVideos[roundIndex];
                if (!usedIds.has(video.id)) {
                    result.push(video);
                    usedIds.add(video.id);
                }
            }
            
            categoryIndex++;
            
            // Si hemos pasado por todas las categorías, ir a la siguiente ronda
            if (categoryIndex % availableCategories.length === 0) {
                roundIndex++;
                // Si no hay más videos en ninguna categoría, salir
                const hasMoreVideos = availableCategories.some(cat => 
                    videosByCategory[cat] && videosByCategory[cat].length > roundIndex
                );
                if (!hasMoreVideos) break;
            }
        }
        
        return result;
    }

            // --- Nueva lógica para selección de videos evitando repeticiones ---
            // 1. Hero Slider (máximo 5 videos, en grande)
            const videosByCategory = videos.reduce((acc, v) => {
                acc[v.category] = acc[v.category] ? [...acc[v.category], v] : [v];
                return acc;
            }, {} as Record<string, Video[]>);

            const topCategories = Object.entries(videosByCategory)
                .sort((a: [string, Video[]], b: [string, Video[]]) => b[1].length - a[1].length)
                .slice(0, 5)
                .map(([cat]) => cat);

            const heroVideos: Video[] = [];
            const usedHeroIds = new Set<string>();
            for (const cat of topCategories) {
                const best = videosByCategory[cat]
                    .filter(v => !usedHeroIds.has(v.id))
                    .sort((a, b) =>
                        (b.rating_percentage ?? 0) - (a.rating_percentage ?? 0) ||
                        (b.good_votes ?? 0) - (a.good_votes ?? 0)
                    )[0];
                if (best) {
                    heroVideos.push(best);
                    usedHeroIds.add(best.id);
                }
                if (heroVideos.length >= 5) break;
            }

            // 2. Carousel "Most Viewed" (máximo 9 videos, sin repetir con Hero)
            const mostViewedVideos = [...videos]
                .filter(v => !usedHeroIds.has(v.id))
                .sort((a, b) => (b.total_votes ?? 0) - (a.total_votes ?? 0))
                .slice(0, 9);
            const usedMostViewedIds = new Set<string>(mostViewedVideos.map(v => v.id));

            // 3. Carousel "Recommended" (máximo 9 videos, sin repetir con Hero ni MostViewed)
            const getMinutes = (duration: string) => {
                const [min, sec] = duration.split(':').map(Number);
                return min + sec / 60;
            };

            const recommendedCandidates = videos.filter(v => {
                const mins = getMinutes(v.duration);
                return mins >= 5 && mins <= 15 && !usedHeroIds.has(v.id) && !usedMostViewedIds.has(v.id);
            }).sort((a, b) => (b.rating_percentage ?? 0) - (a.rating_percentage ?? 0));

            const recommendedVideos: Video[] = [];
            const usedCategories = new Set<string>();
            for (const v of recommendedCandidates) {
                if (recommendedVideos.length >= 9) break;
                if (!usedCategories.has(v.category)) {
                    recommendedVideos.push(v);
                    usedCategories.add(v.category);
                }
            }
            if (recommendedVideos.length < 9) {
                recommendedVideos.push(...recommendedCandidates.slice(recommendedVideos.length, 9));
            }

    // Debug simple solo cuando hay cambios
    useEffect(() => {
        if (videos.length < 23 && videos.length > 0) {
            console.warn(`Solo ${videos.length} videos disponibles`);
        }
        if (heroVideos.length > 0) {
            console.log(`Videos: Hero=${heroVideos.length}, MostViewed=${mostViewedVideos.length}, Recommended=${recommendedVideos.length}`);
        }
    }, [videos.length, heroVideos.length, mostViewedVideos.length, recommendedVideos.length]);

    return (
        <main className="pt-6 pb-0">
            {/* Aquí puedes renderizar el menú y otros módulos fijos que quieras mostrar siempre */}
            {/* Por ejemplo, podrías tener un componente <MainMenu /> aquí */}

            {/* Hero Slider o su skeleton */}
            {heroVideos.length > 0 ? (
                <HeroSlider 
                    videos={heroVideos} 
                    onVideoSelect={onVideoSelect} 
                    basketItems={basketItems}
                    onToggleBasketItem={onToggleBasketItem}
                    onCategorySelect={onCategorySelect}
                />
            ) : (
                <div className="h-64 md:h-80 lg:h-96 bg-neutral-800 rounded-xl animate-pulse mb-8" />
            )}

            {/* Script de anuncio después del Hero Slider */}
            <div 
                dangerouslySetInnerHTML={{
                    __html: `
                        <script>
                        (function(rnnxip){
                        var d = document,
                            s = d.createElement('script'),
                            l = d.scripts[d.scripts.length - 1];
                        s.settings = rnnxip || {};
                        s.src = "//understatednurse.com/cODh9U6.bP2j5YlKShWAQi9kNYjnYJ5uN_DyYkznMDyu0t2eNljCkt0eNbj/MD0Q";
                        s.async = true;
                        s.referrerPolicy = 'no-referrer-when-downgrade';
                        l.parentNode.insertBefore(s, l);
                        })({})
                        </script>
                    `
                }}
            />

            {/* Most Viewed Carousel o su skeleton */}
            <VideoCarousel 
                title="Most viewed" 
                videos={mostViewedVideos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
            {mostViewedVideos.length === 0 && (
                <div className="flex gap-4 px-4 sm:px-6 lg:px-8 overflow-hidden mb-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-60 sm:w-64 md:w-72 flex-shrink-0">
                            <VideoCardSkeleton />
                        </div>
                    ))}
                </div>
            )}

            {/* Recommended Carousel o su skeleton */}
            <VideoCarousel 
                title="Recommended" 
                videos={recommendedVideos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={onToggleBasketItem}
            />
            {recommendedVideos.length === 0 && (
                <div className="flex gap-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-60 sm:w-64 md:w-72 flex-shrink-0">
                            <VideoCardSkeleton />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};