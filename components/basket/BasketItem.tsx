
import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../../types';

// Reusing hooks from VideoCard.tsx
const useInView = (options: IntersectionObserverInit = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options);
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [options]);

  return [ref, isInView] as const;
};

const useVideoFrameExtractor = (videoUrl: string, enabled: boolean) => {
    const [frames, setFrames] = useState<string[]>([]);
    useEffect(() => {
        if (!enabled || !videoUrl) return;
        const extract = async () => {
            try {
                const video = document.createElement('video');
                video.src = videoUrl;
                video.crossOrigin = "anonymous";
                video.muted = true;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) return;
                const capturedFrames: string[] = [];
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const capturePoints = [0, 6, 12, 18, 24];
                    let i = 0;
                    const seekAndCapture = () => {
                        if (i >= capturePoints.length) { setFrames(capturedFrames); return; }
                        video.currentTime = capturePoints[i];
                    };
                    video.onseeked = () => {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        capturedFrames.push(canvas.toDataURL('image/jpeg'));
                        i++;
                        seekAndCapture();
                    };
                    seekAndCapture();
                };
                video.load();
            } catch (error) { console.error("Error extracting frames:", error); }
        };
        extract();
    }, [videoUrl, enabled]);
    return frames;
};


interface BasketItemProps {
    video: Video;
    isAutoplayEnabled: boolean;
    // FIX: videoId should be a string to match video.id type.
    onRemove: (videoId: string) => void;
    onSelect: (video: Video) => void;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-amber-500" : "text-neutral-400 dark:text-neutral-600"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);


export const BasketItem: React.FC<BasketItemProps> = ({ video, isAutoplayEnabled, onRemove, onSelect }) => {
    const { id, title, duration, rating, comments, views, sources } = video;
    const [isHovering, setIsHovering] = useState(false);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    const [cardRef, isInView] = useInView({ threshold: 0.1 });
    const previewFrames = useVideoFrameExtractor(sources?.[0]?.url || '', isInView);
    
    useEffect(() => {
        if (!isAutoplayEnabled && !isHovering) {
            setCurrentPreviewIndex(0);
            return;
        }

        if (previewFrames.length === 0) return;

        const interval = setInterval(() => {
            setCurrentPreviewIndex(prevIndex => (prevIndex + 1) % previewFrames.length);
        }, 1000);

        return () => clearInterval(interval);
    }, [isAutoplayEnabled, isHovering, previewFrames.length]);

    const mainThumbnail = video.thumbnail || `https://picsum.photos/seed/${video.id}/400/225`;
    const currentImage = (isAutoplayEnabled || isHovering) && previewFrames.length > 0 
        ? previewFrames[currentPreviewIndex] 
        : mainThumbnail;

    return (
        <article 
            ref={cardRef}
            className="flex gap-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div 
                className="w-1/3 flex-shrink-0 cursor-pointer"
                onClick={() => onSelect(video)}
            >
                <div className="relative aspect-video w-full bg-neutral-200 dark:bg-neutral-800 rounded-md overflow-hidden">
                     <img src={currentImage} alt={title} className="h-full w-full object-cover transition-opacity duration-200" />
                     <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">{duration}</span>
                </div>
            </div>

            <div className="w-2/3 flex flex-col justify-between">
                <div>
                     <h3 
                        className="font-semibold text-sm line-clamp-2 mb-1 cursor-pointer"
                        onClick={() => onSelect(video)}
                    >
                        {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                            <StarIcon filled={rating > 0} />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                        <span>{comments} comments</span>
                        <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(views)} views</span>
                    </div>
                </div>
                 <button 
                    onClick={() => onRemove(id)}
                    className="self-start mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 px-2 py-1 rounded-md hover:bg-red-500/10"
                >
                    <TrashIcon /> Remove
                </button>
            </div>
        </article>
    );
};
