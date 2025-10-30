import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Video } from '../types';
import { AdSlot } from './AdSlot';
import { VideoCarousel } from './VideoCarousel';

interface Comment {
    id: number;
    text: string;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={filled ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className || (filled ? "text-amber-500" : "text-neutral-400 dark:text-neutral-600")}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const CommentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
   </svg>
);

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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

interface VideoDetailProps {
  video: Video;
  onBack: () => void;
  allVideos: Video[];
  onVideoSelect: (video: Video) => void;
  // FIX: basketItems should be an array of strings to match video.id type.
  basketItems: string[];
  // FIX: videoId should be a string to match video.id type.
  onToggleBasketItem: (videoId: string) => void;
  onCategorySelect: (category: string) => void;
}

const initialComments: Comment[] = [
    { id: 1, text: "Great video, thanks for sharing!" },
    { id: 2, text: "I learned a lot from this tutorial." },
];

export const VideoDetail: React.FC<VideoDetailProps> = ({ video, onBack, allVideos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
  const { id, title, category, rating, comments, views, duration, sources } = video;
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentQuality, setCurrentQuality] = useState(sources[0].quality);
  const [isQualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isVideoInBasket = basketItems.includes(id);

  // Effect for saving and loading video progress
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const progressKey = `video-progress-${id}`;
    let saveInterval: ReturnType<typeof setInterval>;

    const loadProgress = () => {
        const savedTime = localStorage.getItem(progressKey);
        if (savedTime && videoElement) {
            videoElement.currentTime = parseFloat(savedTime);
        }
    };
    
    const startSavingProgress = () => {
      saveInterval = setInterval(() => {
        if (videoElement && !videoElement.paused) {
          localStorage.setItem(progressKey, String(videoElement.currentTime));
        }
      }, 5000);
    };
    
    const stopSavingProgress = () => {
        clearInterval(saveInterval);
    };

    videoElement.addEventListener('loadedmetadata', loadProgress);
    videoElement.addEventListener('play', startSavingProgress);
    videoElement.addEventListener('pause', stopSavingProgress);
    
    loadProgress();

    return () => {
        stopSavingProgress();
        videoElement.removeEventListener('loadedmetadata', loadProgress);
        videoElement.removeEventListener('play', startSavingProgress);
        videoElement.removeEventListener('pause', stopSavingProgress);
        if (videoElement) {
          localStorage.setItem(progressKey, String(videoElement.currentTime));
        }
    };
  }, [id]);

  // Effect for fullscreen detection
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleFullscreenChange = () => {
        const isVideoFullscreen = document.fullscreenElement === videoElement;
        setIsFullscreen(isVideoFullscreen);
        if (!isVideoFullscreen) {
            setQualityMenuOpen(false); // Close menu when exiting fullscreen
        }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleQualityChange = (quality: string) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const currentTime = videoElement.currentTime;
    const isPlaying = !videoElement.paused;

    setCurrentQuality(quality);
    setQualityMenuOpen(false);

    setTimeout(() => {
        const newVideoElement = videoRef.current;
        if (newVideoElement) {
            newVideoElement.currentTime = currentTime;
            if (isPlaying) {
                newVideoElement.play().catch(error => console.error("Autoplay was prevented:", error));
            }
        }
    }, 0);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
        const newCommentObject: Comment = {
            id: Date.now(),
            text: newComment,
        };
        setCommentsList([newCommentObject, ...commentsList]);
        setNewComment("");
    }
  };
  
  const relatedVideos = useMemo(() => {
    const filtered = allVideos.filter(
      (v) => v.category === video.category && v.id !== video.id
    );
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, 9);
  }, [video, allVideos]);

  const currentSourceUrl = sources.find(s => s.quality === currentQuality)?.url || sources[0].url;

  const qualitySelectorUI = (
      <div className="relative">
          <button 
              onClick={() => setQualityMenuOpen(prev => !prev)}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all"
              aria-label="Video settings"
          >
              <SettingsIcon />
          </button>
          {isQualityMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-28 rounded-md bg-black/80 backdrop-blur-sm text-white text-sm font-semibold p-1 z-20">
                  {sources.map(source => (
                      <button 
                          key={source.quality}
                          onClick={() => handleQualityChange(source.quality)}
                          className={`w-full text-left px-2 py-1 rounded ${currentQuality === source.quality ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      >
                          {source.quality}
                      </button>
                  ))}
              </div>
          )}
      </div>
  );

  return (
    <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-6">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          &larr; Back to videos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
        <div className="lg:col-span-2">
            <div className="group relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl">
                <video 
                  ref={videoRef}
                  key={currentSourceUrl}
                  controls 
                  className="h-full w-full object-contain"
                poster={video.thumbnail || `https://picsum.photos/seed/${video.id}/1280/720`}
                >
                    <source src={currentSourceUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100">
                    {!isFullscreen && qualitySelectorUI}
                </div>

                {isFullscreen && createPortal(
                    <div className="fixed top-4 right-4 z-[2147483647]">
                        {qualitySelectorUI}
                    </div>,
                    document.body
                )}
            </div>
        </div>

        <div className="lg:col-span-1">
             <button 
                onClick={() => onCategorySelect(category)}
                className="inline-block bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full px-3 py-1 text-xs font-semibold mb-3 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
             >
                {category}
             </button>
             <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">{title}</h1>

             <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-6 border-y border-neutral-200 dark:border-neutral-800 py-4">
                <div className="flex items-center gap-1.5" title={`Rating: ${rating}`}>
                    <StarRating rating={rating} />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5" title={`${comments} comments`}>
                    <CommentIcon />
                    <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(comments + commentsList.length)}</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(views)} views</span>
                 </div>
             </div>

             <div className="prose prose-sm dark:prose-invert text-neutral-700 dark:text-neutral-300">
                <p>This is a placeholder description for the video. Here you can add more detailed information about the content, context, credits, and relevant links.</p>
                <p>The video has a duration of {duration}.</p>
             </div>

             <div className="mt-6 flex gap-2">
                <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 dark:bg-white dark:text-neutral-900">
                    Like
                </button>
                <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
                    Share
                </button>
                <button 
                  onClick={() => onToggleBasketItem(id)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    isVideoInBasket 
                      ? 'border-neutral-400 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800' 
                      : 'border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
                  }`}
                  aria-label={isVideoInBasket ? "Remove from basket" : "Add to basket"}
                >
                  {isVideoInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
                  <span>{isVideoInBasket ? 'In Basket' : 'Add to Basket'}</span>
                </button>
             </div>

             <div className="mt-8">
                <AdSlot title="Ad Slot – 300x250" description="Vertical ad space" />
             </div>
        </div>
      </div>

      <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 max-w-3xl mx-auto px-4 sm:px-0">
        <h2 className="text-xl font-bold mb-4">Comments ({comments + commentsList.length})</h2>
        <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment as Anonymous..."
                className="w-full rounded-md border border-neutral-300 bg-white p-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:border-white"
                rows={3}
                aria-label="Add a comment"
            />
            <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90 dark:bg-white dark:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Post Comment
                </button>
            </div>
        </form>

        <div className="space-y-4">
            {commentsList.map(comment => (
                <article key={comment.id} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 grid place-items-center font-bold text-sm">A</div>
                        <span className="font-semibold text-sm">Anonymous</span>
                    </div>
                    <p className="text-sm text-neutral-800 dark:text-neutral-300 pl-10">{comment.text}</p>
                </article>
            ))}
        </div>
      </div>
      
      {relatedVideos.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8">
              <VideoCarousel 
                  title="Related Videos"
                  videos={relatedVideos}
                  onVideoSelect={onVideoSelect}
                  basketItems={basketItems}
                  onToggleBasketItem={onToggleBasketItem}
              />
          </div>
      )}

      <div className="mt-12 px-4 sm:px-0">
        <AdSlot title="Ad Slot – 728x90" description="Horizontal ad space" />
      </div>
    </main>
  );
};
