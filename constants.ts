// constants.ts

import { Video, Category } from './types';
import DICTIONARY_ES from './dictionaries/dictionary-es';

// =====================================================
// Helpers numéricos / formato (sin cambios relevantes)
// =====================================================

/**
 * Convierte strings tipo "8.1k" -> 8100, "279" -> 279
 */
const parseKString = (str: string): number => {
    if (typeof str !== 'string') return 0;
    const lower = str.toLowerCase().trim();
    if (lower.endsWith('k')) {
        return parseFloat(lower.slice(0, -1)) * 1000;
    }
    return parseFloat(lower) || 0;
};

/**
 * Convierte "10,695 votes" -> 10695
 */
const parseVotesString = (str: string): number => {
    if (typeof str !== 'string') return 0;
    return parseInt(
        str.replace(/,/g, '').replace(' votes', ''),
        10
    ) || 0;
};

/**
 * Normaliza duración: "8 min" -> "08:00", "37 sec" -> "00:37"
 */
const formatDuration = (durationStr: string): string => {
    if (typeof durationStr !== 'string') return '00:00';

    const parts = durationStr.toLowerCase().split(' ');
    if (parts.length < 2) return '00:00';

    const value = parseInt(parts[0], 10);
    const unit = parts[1];

    if (unit.startsWith('min')) {
        const minutes = String(value).padStart(2, '0');
        return `${minutes}:00`;
    }
    if (unit.startsWith('sec')) {
        const seconds = String(value).padStart(2, '0');
        return `00:${seconds}`;
    }
    return '00:00';
};

// Convierte strings como "1,234,567", "1.2M", "950K" a número
function parseViews(str: any): number {
    if (typeof str === 'number') return str;
    if (typeof str !== 'string') return 0;
    const s = str.replace(/,/g, '').trim().toUpperCase();
    if (s.endsWith('M')) return Math.round(parseFloat(s) * 1_000_000);
    if (s.endsWith('K')) return Math.round(parseFloat(s) * 1_000);
    return parseInt(s, 10) || 0;
}

// =====================================================
// CATEGORÍAS FIJAS
// =====================================================
//
// Ahora dejamos de inferir dinámicamente y asumimos estas categorías
// exactas que tú pasaste. Mantenemos un label humano y el value que
// usaremos para filtrar.
//
// NOTA: el "value" debe coincidir con lo que uses para identificar
// esa categoría dentro del JSON del backend (keys) o con el campo
// .category de cada video. Si tu backend guarda exactamente
// "/c/Oiled-22", etc., entonces usamos exactamente eso.
//

export const CATEGORY_LABELS: Record<string, string> = {
    "/c/Oiled-22":                 "Oiled",
    "/c/Gapes-167":                "Gapes",
    "/c/AI-239":                   "AI",
    "/c/Amateur-65":               "Amateur",
    "/c/Anal-12":                  "Anal",
    "/c/Asian_Woman-32":           "Asian Woman",
    "/c/ASMR-229":                 "ASMR",
    "/c/Cam_Porn":                 "Cam Porn",
    "/?k=caseros&top":             "Caseros",
    "/?k=casting&top":             "Casting",
    "/?k=chilenas&top":            "Chilenas",
    "/c/Cuckold-237":              "Cuckold",
    "/c/Cumshot-18":               "Cumshot",
    "/c/Squirting-56":             "Squirting",
    "/c/Creampie-40":              "Creampie",
    "/c/Big_Ass-24":               "Big Ass",
    "/?k=culonas&top":             "Culonas",
    "/c/Femdom-235":               "Femdom",
    "/c/Fucked_Up_Family-81":      "Fucked Up Family",
    "/c/Fisting-165":              "Fisting",
    "/c/Gangbang-69":              "Gangbang",
    "/c/Interracial-27":           "Interracial",
    "/c/Teen-13":                  "Teen",
    "/c/Latina-16":                "Latina",
    "/c/Lingerie-83":              "Lingerie",
    "/c/Lesbian-26":               "Lesbian",
    "/?k=lesbianas&top":           "Lesbianas",
    "/?k=maduras&top":             "Maduras",
    "/c/Mature-38":                "Mature",
    "/?k=mamada&top":              "Mamada",
    "/c/Blowjob-15":               "Blowjob",
    "/c/Stockings-28":             "Stockings",
    "/c/Milf-19":                  "Milf",
    "/c/Brunette-25":              "Brunette",
    "/c/Black_Woman-30":           "Black Woman",
    "/c/Redhead-31":               "Redhead",
    "/c/Big_Cock-34":              "Big Cock",
    "/?k=real&top":                "Real",
    "/c/Blonde-20":                "Blonde",
    "/c/Solo_and_Masturbation-33": "Solo / Masturbation",
    "/?k=sub+espanol&top":         "Sub Español",
    "/c/Big_Tits-23":              "Big Tits",
    "/?k=trios&top":               "Trios",
    "/gay?fmc=1":                  "Gay",
    "/shemale?fmc=1":              "Shemale",
};

// esta lista fija de categorías reemplaza category_names_list del scraper
export const CATEGORY_LIST: string[] = [
    "/c/Oiled-22",
    "/c/Gapes-167",
    "/c/AI-239",
    "/c/Amateur-65",
    "/c/Anal-12",
    "/c/Asian_Woman-32",
    "/c/ASMR-229",
    "/c/Cam_Porn",
    "/?k=caseros&top",
    "/?k=casting&top",
    "/?k=chilenas&top",
    "/c/Cuckold-237",
    "/c/Cumshot-18",
    "/c/Squirting-56",
    "/c/Creampie-40",
    "/c/Big_Ass-24",
    "/?k=culonas&top",
    "/c/Femdom-235",
    "/c/Fucked_Up_Family-81",
    "/c/Fisting-165",
    "/c/Gangbang-69",
    "/c/Interracial-27",
    "/c/Teen-13",
    "/c/Latina-16",
    "/c/Lingerie-83",
    "/c/Lesbian-26",
    "/?k=lesbianas&top",
    "/?k=maduras&top",
    "/c/Mature-38",
    "/?k=mamada&top",
    "/c/Blowjob-15",
    "/c/Stockings-28",
    "/c/Milf-19",
    "/c/Brunette-25",
    "/c/Black_Woman-30",
    "/c/Redhead-31",
    "/c/Big_Cock-34",
    "/?k=real&top",
    "/c/Blonde-20",
    "/c/Solo_and_Masturbation-33",
    "/?k=sub+espanol&top",
    "/c/Big_Tits-23",
    "/?k=trios&top",
    "/gay?fmc=1",
    "/shemale?fmc=1",
];

// =====================================================
// Transformador de videos
// =====================================================

const transformRawVideoToVideo = (rawVideo: any): Video => {
    const totalVotesNum = parseVotesString(rawVideo.total_votes);
    const goodVotesNum = parseKString(rawVideo.good_votes);
    const badVotesNum = parseKString(rawVideo.bad_votes);
    const viewsNum = parseViews(
        rawVideo.views ||
        rawVideo.visits ||
        rawVideo.total_views ||
        rawVideo.totalVotes ||
        rawVideo.total_votes
    );

    // rating escala 1-5
    const rating = totalVotesNum > 0
        ? Math.max(1, (goodVotesNum / totalVotesNum) * 5)
        : 3.5; // default si no hay votos

    // construir lista de fuentes por calidad
    let sources: { quality: string; url: string }[] = [];
    if (
        Array.isArray(rawVideo.available_qualities) &&
        rawVideo.available_qualities.length > 0 &&
        rawVideo.url
    ) {
        for (const q of rawVideo.available_qualities) {
            let urlForQuality = rawVideo.url;
            urlForQuality = urlForQuality.replace(
                /(360p|480p|720p|1080p)/,
                q
            );
            sources.push({
                quality: q,
                url: urlForQuality,
            });
        }
    } else if (rawVideo.url) {
        sources = [
            {
                quality: 'default',
                url: rawVideo.url,
            },
        ];
    }

    // Filtro estricto: si el thumbnail es de picsum.photos, NO devolver el video (retornar null)
    const thumb = rawVideo.thumbnail || rawVideo.preview_src || `https://picsum.photos/seed/${rawVideo.id}/400/225`;
    if (thumb.includes('picsum.photos')) {
        return null;
    }
    return {
        id: rawVideo.id,
        title: rawVideo.title,
        duration: formatDuration(rawVideo.duration),
        category: rawVideo.category,
        categoryLabel: DICTIONARY_ES[rawVideo.category] || rawVideo.category,
        views: viewsNum,
        rating: parseFloat(rating.toFixed(1)),
        total_votes: totalVotesNum,
        good_votes: goodVotesNum,
        bad_votes: badVotesNum,
        sources,
        thumbnail: thumb,
        page_url: rawVideo.page_url || rawVideo.pageUrl || '',
    };
};

// =====================================================
// Categorías visibles en el frontend
// =====================================================
//
// Dejamos de inferir categorías desde los videos dinámicamente.
// Ahora devolvemos SIEMPRE el set fijo anterior + "All".
// El label sale de CATEGORY_LABELS.
//

const buildCategoriesFromFixedList = (): Category[] => {
    const cats: Category[] = [
        { label: 'All', value: 'all' },
        ...CATEGORY_LIST.map((catPath) => ({
            label: CATEGORY_LABELS[catPath] || catPath,
            value: catPath,
        })),
    ];
    return cats;
};

// =====================================================
// API pública para el frontend
// =====================================================

/**
 * Llama al backend (/api/videos),
 * transforma todo a Video[],
 * y devuelve las categorías fijas.
 */
export const fetchVideosAndCategories = async (): Promise<{
    videos: Video[];
    categories: Category[];
}> => {
    // Solo obtener la primera página (por ejemplo, 100 videos)
    const res = await fetch('/api/videos?page=1&size=100');
    if (!res.ok) {
        throw new Error('No se pudo obtener /api/videos');
    }
    const data = await res.json();
    // Normalize: backend returns { "/c/AI-239": [ ... ], ... }
    // Filtrar nulos antes de mapear
    const allRawVideos = Object.values(data).flat().filter(Boolean);
    const videos: Video[] = allRawVideos
        .map(transformRawVideoToVideo)
        .filter(Boolean); // Por si transformRawVideoToVideo retorna null
    const categories = buildCategoriesFromFixedList();
    return {
        videos,
        categories,
    };
};

/**
 * Obtiene videos diversos de múltiples categorías para la página Home
 */
export const fetchDiverseVideosForHome = async (): Promise<{
    videos: Video[];
    categories: Category[];
}> => {
    try {
        // Usar las categorías que sabemos que tienen contenido en el backend
        const availableCategories = [
            "/c/Oiled-22",
            "/c/Gapes-167", 
            "/c/AI-239",
            "/c/Asian_Woman-32"
        ];
        
        const allVideos: Video[] = [];
        const videosPerCategory = 20; // 20 videos por categoría = 80 total
        
        // Obtener videos de cada categoría específica
        for (const category of availableCategories) {
            try {
                const res = await fetch(`/api/videos?category=${encodeURIComponent(category)}&page=1&size=${videosPerCategory}`);
                
                if (res.ok) {
                    const data = await res.json();
                    const categoryVideos = data.videos || [];
                    
                    if (categoryVideos.length > 0) {
                        const transformedVideos = categoryVideos
                            .map(transformRawVideoToVideo)
                            .filter(Boolean); // Filtrar nulls
                        
                        allVideos.push(...transformedVideos);
                    }
                }
            } catch (error) {
                console.warn(`Error obteniendo categoría ${category}:`, error);
            }
        }
        
        // Verificar que tenemos diversidad
        const categoriesFound = [...new Set(allVideos.map(v => v.category))];
        console.log(`Categorías obtenidas: ${categoriesFound.length} (${categoriesFound.map(c => CATEGORY_LABELS[c] || c).join(', ')})`);
        
        // Mezclar todos los videos para distribución aleatoria
        const shuffledVideos = allVideos.sort(() => Math.random() - 0.5);
        
        const categoriesList = buildCategoriesFromFixedList();
        
        return {
            videos: shuffledVideos,
            categories: categoriesList
        };
        
    } catch (error) {
        console.error('Error en fetchDiverseVideosForHome:', error);
        throw error;
    }
};
