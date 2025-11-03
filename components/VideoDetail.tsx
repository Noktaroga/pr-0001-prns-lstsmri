import DICTIONARY_ES from '../dictionaries/dictionary-es';
import DICTIONARY_ENG from '../dictionaries/dictionary-eng';
// Formatea el número de forma escalable para valores grandes
function formatShortCount(n: number): string {
    if (n < 50) return "-50";
    if (n < 1000) return `+${Math.floor(n / 50) * 50}`;
    if (n < 10000) return `+${Math.floor(n / 100) * 100}`;
    if (n < 100000) return `+${Math.floor(n / 500) * 500}`;
    if (n < 1000000) return `+${Math.floor(n / 10000) * 10}K`;
    if (n < 10000000) return `+${Math.floor(n / 100000) * 100}K`;
    return `+${Math.floor(n / 1000000)}M`;
}
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Video } from '../types';
import { AdSlot } from './AdSlot';
import JuicyAdsVertical from './JuicyAdsVertical';
import JuicyAdsHorizontal from './JuicyAdsHorizontal';
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
  relatedVideos: Video[];
  onVideoSelect: (video: Video) => void;
  basketItems: string[];
  onToggleBasketItem: (videoId: string) => void;
  onCategorySelect: (category: string) => void;
}

const initialComments: Comment[] = [
    { id: 1, text: "Great video, thanks for sharing!" },
    { id: 2, text: "I learned a lot from this tutorial." },
];

export const VideoDetail: React.FC<VideoDetailProps> = ({ video, onBack, relatedVideos, onVideoSelect, basketItems, onToggleBasketItem, onCategorySelect }) => {
  // Asegura que sources siempre sea un array
  const { id, title, category, rating, total_votes, good_votes, bad_votes, duration } = video;
  const sources = Array.isArray(video.sources) && video.sources.length > 0 ? video.sources : [{ quality: 'default', url: '' }];
  // Obtener URLs de video haciendo POST a /api/selenium-scrape
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  useEffect(() => {
    const fetchLinks = async () => {
      setLoadingLinks(true);
      setFetchError(null);
      try {
        // Usa video.page_url si existe, si no, usa video.url
        const pageUrl = video.page_url || video.url;
        if (!pageUrl) {
          setFetchError('No page URL provided');
          setLoadingLinks(false);
          return;
        }
        const response = await fetch('/api/selenium-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_url: pageUrl })
        });
        if (!response.ok) throw new Error('Error en la petición');
        const data = await response.json();
        if (Array.isArray(data.video_links)) {
          setVideoLinks(data.video_links);
          console.log('[VideoDetail] video_links recibidos:', data.video_links);
        } else {
          setFetchError('Respuesta inesperada del backend');
        }
      } catch (err: any) {
        setFetchError(err.message || 'Error desconocido');
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinks();
  }, [video.page_url, video.url, id]);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adOverlayStep, setAdOverlayStep] = useState(1); // 1: first ad, 2: second ad, 0: none
  
  const [currentQuality, setCurrentQuality] = useState(sources[0]?.quality || 'default');
        const [validSourceUrl, setValidSourceUrl] = useState<string | null>(null);
        // DEBUG: Log inicial de props video
        useEffect(() => {
            console.debug('[VideoDetail] video prop:', video);
        }, [video]);
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

    // Block play if ad overlay is visible
    const blockPlay = (e: Event) => {
      if (adOverlayStep !== 0) {
        e.preventDefault();
        videoElement.pause();
      }
    };
    videoElement.addEventListener('play', blockPlay, true);

    return () => {
        stopSavingProgress();
        videoElement.removeEventListener('loadedmetadata', loadProgress);
        videoElement.removeEventListener('play', startSavingProgress);
        videoElement.removeEventListener('pause', stopSavingProgress);
        videoElement.removeEventListener('play', blockPlay, true);
        if (videoElement) {
          localStorage.setItem(progressKey, String(videoElement.currentTime));
        }
    };
  }, [id, adOverlayStep]);

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
  
  // Filtro estricto de thumbnails válidos
  const isValidThumbnail = (thumb?: string) => {
    return !!thumb &&
      !thumb.toLowerCase().includes('w3') &&
      !thumb.toLowerCase().includes('placeholder') &&
      !thumb.toLowerCase().includes('default') &&
      thumb.trim() !== '';
  };

  const validRelated = useMemo(() => {
    const filtered = relatedVideos.filter(v => v.id !== video.id && isValidThumbnail(v.thumbnail));
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered.slice(0, 9);
  }, [video, relatedVideos]);


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
                {loadingLinks ? (
                  <div className="flex items-center justify-center h-full">Cargando enlaces de video...</div>
                ) : fetchError ? (
                  <div className="flex items-center justify-center h-full text-red-600">{fetchError}</div>
                ) : videoLinks.length > 0 ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      key={videoLinks[videoLinks.length - 1] || 'no-link'}
                      controls
                      className="h-full w-full object-contain"
                      {...(video.thumbnail ? { poster: video.thumbnail } : {})}
                      crossOrigin="anonymous"
                      onError={e => {
                        console.error('[VideoDetail] <video> onError', e, 'src:', videoLinks[videoLinks.length - 1]);
                      }}
                      onLoadedData={e => {
                        console.debug('[VideoDetail] <video> onLoadedData', e, 'src:', videoLinks[videoLinks.length - 1]);
                      }}
                      onPlay={e => {
                        console.debug('[VideoDetail] <video> onPlay', e, 'src:', videoLinks[videoLinks.length - 1]);
                      }}
                    >
                      {/* Usar el último enlace como fuente principal */}
                      <source src={videoLinks[1]} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {adOverlayStep === 1 && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
                        {/* JuicyAds v3.0 - Primer anuncio */}
                        <div
                          id="juicy-ad-1104275"
                          className="mb-4 flex items-center justify-center cursor-pointer"
                          style={{ width: 308, height: 286, background: 'white', borderRadius: 12 }}
                          onClick={() => setAdOverlayStep(2)}
                        >
                          <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
                          <ins id="1104275" data-width="308" data-height="286"></ins>
                          <script type="text/javascript" data-cfasync="false" async>{`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1104275});`}</script>
                        </div>
                        <div className="text-xs text-neutral-200 mt-2">Haz click en el anuncio para continuar</div>
                      </div>
                    )}
                    {adOverlayStep === 2 && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
                        {/* JuicyAds v3.0 - Segundo anuncio (puedes cambiar el adzone si tienes otro) */}
                        <div
                          id="juicy-ad-1104276"
                          className="mb-4 flex items-center justify-center cursor-pointer"
                          style={{ width: 308, height: 286, background: 'white', borderRadius: 12 }}
                          onClick={() => setAdOverlayStep(0)}
                        >
                          <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
                          <ins id="1104275" data-width="308" data-height="286"></ins>
                          <script type="text/javascript" data-cfasync="false" async>{`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1104275});`}</script>
                        </div>
                        <div className="text-xs text-neutral-200 mt-2">Haz click en el anuncio para desbloquear el video</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">No se encontraron enlaces de video.</div>
                )}
            </div>
        </div>

        <div className="lg:col-span-1">
                 <button 
                     onClick={() => onCategorySelect(category)}
                     className="inline-block bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full px-3 py-1 text-xs font-semibold mb-3 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                 >
                     {(() => {
                        const lang = (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
                        const DICTIONARIES = [DICTIONARY_ES, DICTIONARY_ENG];
                        let normalizedCategory = category.startsWith('/') ? category : '/' + category;
                        let mapped = '';
                        for (const DICTIONARY of DICTIONARIES) {
                          mapped = DICTIONARY[normalizedCategory]
                             || DICTIONARY[normalizedCategory.replace(/\s+/g, '').toLowerCase()]
                             || DICTIONARY[category]
                             || DICTIONARY[category.replace(/\s+/g, '').toLowerCase()];
                          if (mapped) break;
                        }
                        return mapped || category;
                     })()}
                 </button>
             <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">{title}</h1>

             <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-6 border-y border-neutral-200 dark:border-neutral-800 py-4">
                <div className="flex items-center gap-2" title={`Rating: ${rating}`}> 
                    <StarRating rating={rating} />
                </div>
                                <div className="flex items-center gap-2">
                                    <span title="Votos buenos" className="text-green-600 flex items-center gap-1">👍<span>{formatShortCount(good_votes)}</span></span>
                                    <span title="Votos malos" className="text-red-600 flex items-center gap-1">👎<span>{formatShortCount(bad_votes)}</span></span>
                                </div>
                                {/* visitas eliminadas */}
             </div>



             <div className="mt-6 flex gap-2">
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
                         {/* JuicyAds 300x250 ad below Like/Add to Basket */}
                         <div className="mt-4 flex justify-center">
                           <div style={{ width: 300, height: 250 }}>
                             <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
                             <ins id="1104271" data-width="300" data-height="250"></ins>
                             <script type="text/javascript" data-cfasync="false" async>{`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1104271});`}</script>
                           </div>
                         </div>

         {/* Vertical ad removed as requested */}
        </div>
      </div>


      

    {/* Horizontal ad above related videos */}
    <div className="mt-12 px-4 sm:px-0">
      <JuicyAdsHorizontal adzoneId={1104273} width={728} height={90} />
    </div>

    {validRelated.length > 0 && (
      <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <VideoCarousel 
          title="Related Videos"
          videos={validRelated}
          onVideoSelect={onVideoSelect}
          basketItems={basketItems}
          onToggleBasketItem={onToggleBasketItem}
        />
      </div>
    )}

      <div className="mt-12 px-4 sm:px-0">
  <JuicyAdsHorizontal adzoneId={1104273} width={728} height={90} />
      </div>
    </main>
  );
};
