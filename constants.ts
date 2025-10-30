// constants.ts (nuevo enfoque dinámico vía API)

import { Video, Category } from './types';

// --- Helper Functions to Parse Raw Data ---

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

// -------------------------------------------------------------------
// Transformador de un item crudo del backend a tu tipo interno Video
// -------------------------------------------------------------------

const transformRawVideoToVideo = (rawVideo: any): Video => {
    const totalVotesNum = parseVotesString(rawVideo.total_votes);
    const goodVotesNum = parseKString(rawVideo.good_votes);

    // rating en escala 1-5
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
        // NOTA: en tu código original intentabas reemplazar "360p|480p|720p..."
        // Eso asume que la URL contiene la calidad. Lo mantenemos igual.
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

    return {
        id: rawVideo.id,
        title: rawVideo.title,
        duration: formatDuration(rawVideo.duration),
        category: rawVideo.category,
        views: totalVotesNum,
        rating: parseFloat(rating.toFixed(1)),
        comments:
            Math.floor(totalVotesNum / 150) +
            Math.floor(Math.random() * 20),
        sources,
        thumbnail:
            rawVideo.thumbnail ||
            rawVideo.preview_src ||
            `https://picsum.photos/seed/${rawVideo.id}/400/225`,
    };
};

// -------------------------------------------------------------------
// Generar categorías a partir de la lista normalizada de videos
// -------------------------------------------------------------------

const buildCategoriesFromVideos = (videos: Video[]): Category[] => {
    const categorySet = new Set<string>();

    for (const v of videos) {
        if (v.category) {
            categorySet.add(v.category);
        }
    }

    const generatedCategories: Category[] = Array.from(categorySet).map(
        (value) => {
            // "/c/Arab-159" -> "Arab"
            const parts = value.split('/');
            const lastPart = parts[parts.length - 1];
            const labelRaw = lastPart.split('-')[0];
            const label =
                labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);

            return {
                label,
                value,
            };
        }
    );

    return [
        { label: 'All', value: 'all' },
        ...generatedCategories,
    ];
};

// -------------------------------------------------------------------
// API pública para el frontend
// -------------------------------------------------------------------

/**
 * Llama al backend (/api/videos),
 * transforma todo a Video[],
 * y además calcula las categorías.
 */
export const fetchVideosAndCategories = async (): Promise<{
    videos: Video[];
    categories: Category[];
}> => {
    const res = await fetch('/api/videos');
    if (!res.ok) {
        throw new Error('No se pudo obtener /api/videos');
    }

    const rawData = await res.json();

    // rawData es un objeto donde cada key es una categoría
    // y el value es array de videos crudos. Igual que antes.
    // Ej:
    // {
    //   "amateur": [ {...}, {...} ],
    //   "latina":  [ {...}, {...} ],
    //    ...
    // }

    const allVideos: Video[] = [];

    for (const videoList of Object.values(rawData)) {
        for (const rawVideo of videoList as any[]) {
            // filtramos solo los que tengan al menos id y url o thumbnail
            if (!rawVideo || !rawVideo.id) continue;

            const video = transformRawVideoToVideo(rawVideo);
            allVideos.push(video);
        }
    }

    const categories = buildCategoriesFromVideos(allVideos);

    return {
        videos: allVideos,
        categories,
    };
};
