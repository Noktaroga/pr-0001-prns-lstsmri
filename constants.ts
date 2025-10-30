import rawData from './data.json';
import { Video, Category } from './types';

// --- Helper Functions to Parse Raw Data ---

/**
 * Parses a string that might contain 'k' for thousands.
 * Example: "8.1k" => 8100, "279" => 279
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
 * Parses a vote string, removing commas and text.
 * Example: "10,695 votes" => 10695
 */
const parseVotesString = (str: string): number => {
    if (typeof str !== 'string') return 0;
    return parseInt(str.replace(/,/g, '').replace(' votes', ''), 10) || 0;
};

/**
 * Formats duration from "X min" or "Y sec" to "MM:SS".
 * This format is compatible with the app's filtering logic.
 */
const formatDuration = (durationStr: string): string => {
    if (typeof durationStr !== 'string') return "00:00";
    
    const parts = durationStr.toLowerCase().split(' ');
    if (parts.length < 2) return "00:00";

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
    return "00:00";
};

// --- Data Transformation ---

const allVideos: Video[] = [];
const categorySet = new Set<string>();

// Process raw data from JSON
for (const videoList of Object.values(rawData)) {
    // FIX: Cast `videoList` to `any[]` to allow iteration, as its type is inferred as `unknown` from the JSON import.
    for (const rawVideo of (videoList as any[])) {
        
        // Ensure the video has a valid category before processing
        if (rawVideo.category) {
            categorySet.add(rawVideo.category);
        }

        const totalVotesNum = parseVotesString(rawVideo.total_votes);
        const goodVotesNum = parseKString(rawVideo.good_votes);
        
        // Calculate rating on a 5-star scale. Avoid division by zero.
        const rating = totalVotesNum > 0 
            ? Math.max(1, (goodVotesNum / totalVotesNum) * 5) 
            : 3.5; // Default rating if no votes
        
        // Build sources array based on available_qualities if present
        let sources: { quality: string; url: string }[] = [];
        if (Array.isArray(rawVideo.available_qualities) && rawVideo.available_qualities.length > 0 && rawVideo.url) {
            // Try to replace the quality in the URL for each available quality
            // Assume the URL contains the quality as a substring (e.g., 360p, 480p, 720p)
            for (const quality of rawVideo.available_qualities) {
                // Try to replace any known quality in the URL with the current one
                let urlForQuality = rawVideo.url;
                urlForQuality = urlForQuality.replace(/(360p|480p|720p|1080p)/, quality);
                sources.push({ quality, url: urlForQuality });
            }
        } else if (rawVideo.url) {
            // Only one quality or unknown, just use the main URL
            sources = [{ quality: 'default', url: rawVideo.url }];
        }

        const video: Video = {
            id: rawVideo.id,
            title: rawVideo.title,
            duration: formatDuration(rawVideo.duration),
            category: rawVideo.category,
            views: totalVotesNum,
            rating: parseFloat(rating.toFixed(1)),
            // Generate plausible comment count based on views
            comments: Math.floor(totalVotesNum / 150) + Math.floor(Math.random() * 20),
            sources,
            // Always use thumbnail from data.json if present
            thumbnail: rawVideo.thumbnail || rawVideo.preview_src || `https://picsum.photos/seed/${rawVideo.id}/400/225`,
        };

        allVideos.push(video);
    }
}

// --- Dynamic Category Generation ---

const generatedCategories: Category[] = Array.from(categorySet).map(value => {
    // Create a user-friendly label from the category value.
    // E.g., "/c/Arab-159" becomes "Arab"
    const parts = value.split('/');
    const lastPart = parts[parts.length - 1];
    const label = lastPart.split('-')[0];
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    
    return {
        label: capitalizedLabel,
        value: value,
    };
});

// --- Exported Constants ---

export const demoVideos: Video[] = allVideos;

export const categories: Category[] = [
    { label: "All", value: "all" },
    ...generatedCategories
];