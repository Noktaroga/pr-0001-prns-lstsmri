
import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';

// Custom hook to detect if an element is in the viewport
const useInView = (options: IntersectionObserverInit = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // Disconnect after it's visible
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isInView] as const;
};


// Custom hook to extract frames from a video
const useVideoFrameExtractor = (videoUrl: string, enabled: boolean) => {
    const [frames, setFrames] = useState<string[]>([]);
    
    useEffect(() => {
        if (!enabled || !videoUrl) return;

        const extract = async () => {
            try {
                const video = document.createElement('video');
                video.src = videoUrl;
                video.crossOrigin = "anonymous"; // Required for CORS
                video.muted = true;

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) return;
                
                const capturedFrames: string[] = [];

                const onLoadedMetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const capturePoints = [0, 6, 12, 18, 24, 30]; // Seconds
                    let currentPoint = 0;

                    const seekAndCapture = () => {
                        if (currentPoint >= capturePoints.length) {
                            setFrames(capturedFrames);
                            return;
                        }
                        video.currentTime = capturePoints[currentPoint];
                    };

                    video.onseeked = () => {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        capturedFrames.push(canvas.toDataURL('image/jpeg'));
                        currentPoint++;
                        seekAndCapture();
                    };

                    seekAndCapture();
                };

                video.addEventListener('loadedmetadata', onLoadedMetadata);
                video.load();

                return () => {
                    video.removeEventListener('loadedmetadata', onLoadedMetadata);
                };

            } catch (error) {
                console.error("Error extracting frames:", error);
            }
        };

        extract();

    }, [videoUrl, enabled]);

    return frames;
};


interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isInBasket: boolean;
  // FIX: videoId should be a string to match video.id type.
  onToggleBasketItem: (videoId: string) => void;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill={filled ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={filled ? "text-amber-500" : "text-neutral-400 dark:text-neutral-600"}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const CommentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
   </svg>
);

const BasketAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <path d="M18 10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <path d="M14 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12"></path>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const BasketCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M6 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <path d="M18 10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <path d="M14 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12"></path>
        <polyline points="8 12 11 15 16 10"></polyline>
    </svg>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.round(rating);
    return (
        <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < fullStars} />
            ))}
        </div>
    );
};


export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isInBasket, onToggleBasketItem }) => {
  const { id, title, duration, category, views, rating, comments, sources } = video;
  const [isHovering, setIsHovering] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const [cardRef, isInView] = useInView({ threshold: 0.1 });
  const previewFrames = useVideoFrameExtractor(sources?.[0]?.url || '', isInView);
  
  useEffect(() => {
    if (!isHovering) {
      setCurrentPreviewIndex(0);
      return;
    }

    if (previewFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPreviewIndex(prevIndex => (prevIndex + 1) % previewFrames.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovering, previewFrames.length]);
  
  const handleBasketClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleBasketItem(id);
  };
  
  const mainThumbnail = video.thumbnail;
  const currentImage = (isHovering && previewFrames.length > 0) ? previewFrames[currentPreviewIndex] : mainThumbnail;

  return (
    <article
      ref={cardRef}
      className="group/card overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 relative"
      role="article"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button 
        onClick={handleBasketClick}
        aria-label={isInBasket ? "Remove from basket" : "Add to basket"}
        className={`absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                    bg-black/50 backdrop-blur-sm text-white 
                    opacity-0 group-hover/card:opacity-100
                    hover:scale-110 hover:bg-black/70
                    ${isInBasket ? 'opacity-100' : ''}`}
      >
        {isInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
      </button>

      <button onClick={onClick} className="block w-full text-left">
        <div className="relative h-40 w-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700">
          <img src={currentImage} alt={title} className="h-full w-full object-cover transition-opacity duration-200" />
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{duration}</span>
        </div>
        <div className="space-y-2 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-neutral-600 dark:group-hover:text-neutral-300">{title}</h3>
          
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
            <StarRating rating={rating} />
            <div className="flex items-center gap-1.5" title={`${comments} comments`}>
                <CommentIcon />
                <span>{comments}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs opacity-70 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>{category}</span>
            <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(views)} views</span>
          </div>
        </div>
      </button>
    </article>
  );
};
