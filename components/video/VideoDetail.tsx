import DICTIONARY_ENG from '../../dictionaries/dictionary-eng';
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

// Función para generar Schema.org VideoObject structured data
function generateVideoSchema(video: Video): string {
    // Convertir duración de formato MM:SS o HH:MM:SS a ISO 8601 duration (PT2M35S)
    const convertDurationToISO = (duration: string): string => {
        const parts = duration.split(':').map(Number);
        if (parts.length === 2) {
            // MM:SS format
            const [minutes, seconds] = parts;
            return `PT${minutes}M${seconds}S`;
        } else if (parts.length === 3) {
            // HH:MM:SS format
            const [hours, minutes, seconds] = parts;
            return `PT${hours}H${minutes}M${seconds}S`;
        }
        return 'PT0S'; // fallback
    };

    // Generar descripción basada en categoría y rating
    const generateDescription = (video: Video): string => {
        const categoryName = video.categoryLabel || video.category;
        const rating = video.rating ? `${video.rating}/5 stars` : '';
        const votes = video.total_votes ? `${video.total_votes} votes` : '';
        
        let description = `${categoryName} video`;
        if (rating && votes) {
            description += ` - Rated ${rating} (${votes})`;
        }
        if (video.duration) {
            description += ` - Duration: ${video.duration}`;
        }
        
        return description.substring(0, 200); // Google recommends max 200 chars for description
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": video.title,
        "description": generateDescription(video),
        "thumbnailUrl": video.thumbnail || '',
        "uploadDate": new Date().toISOString(), // Formato ISO completo con zona horaria
        "duration": convertDurationToISO(video.duration || '0:00'),
        "contentUrl": `${window.location.origin}/video/${video.id}`,
        "embedUrl": `${window.location.origin}/video/${video.id}`,
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "http://schema.org/WatchAction",
                "userInteractionCount": video.views || 0
            },
            {
                "@type": "InteractionCounter", 
                "interactionType": "http://schema.org/LikeAction",
                "userInteractionCount": video.good_votes || 0
            }
        ],
        "aggregateRating": video.rating && video.total_votes ? {
            "@type": "AggregateRating",
            "ratingValue": Math.min(Math.max(parseFloat(video.rating.toString()) || 3.5, 1), 5), // Asegurar rango 1-5
            "ratingCount": parseInt(video.total_votes.toString(), 10),
            "bestRating": 5,
            "worstRating": 1
        } : undefined,
        "genre": video.categoryLabel || video.category,
        "isFamilyFriendly": false, // Adult content
        "inLanguage": "en"
    };

    // Remove undefined values
    const cleanSchema = JSON.parse(JSON.stringify(schema));
    
    return JSON.stringify(cleanSchema, null, 2);
}

// Función para generar metadatos Open Graph y SEO
function generateSeoMetadata(video: Video) {
    const categoryName = video.categoryLabel || video.category;
    const safeRating = Math.min(Math.max(parseFloat(video.rating?.toString() || '3.5'), 1), 5).toFixed(1);
    const description = `Watch ${video.title} - ${categoryName} video with ${video.duration} duration. Rated ${safeRating}/5 with ${video.total_votes} votes.`;
    
    return {
        title: `${video.title} - PORNSTERS`,
        description: description.substring(0, 160), // Límite de meta description
        ogTitle: video.title,
        ogDescription: description.substring(0, 200), // Límite de OG description
        ogType: 'video.other',
        ogUrl: `${window.location.origin}${window.location.pathname}${window.location.search}`,
        ogImage: video.thumbnail || '',
        ogVideoDuration: video.duration || '',
        twitterCard: 'summary_large_image',
        twitterTitle: video.title,
        twitterDescription: description.substring(0, 140),
        twitterImage: video.thumbnail || '',
        // Metaetiquetas de contenido adulto
        adultContent: {
            rating: 'RTA-5042-1996-1400-1577-RTA', // Rating estándar para contenido adulto
            audience: 'adults only',
            contentRating: 'adult',
            safeSearch: 'strict',
            ageGate: '18+',
            label: 'restricted'
        }
    };
}
import React, { useState, useRef, useEffect, useMemo } from 'react';
import VideoAdManager from './VideoAdManager';
import Hls from 'hls.js';
import { createPortal } from 'react-dom';
import { Video } from '../../types';
import { AdSlot } from '../ads/AdSlot';
import { VideoCarousel } from './VideoCarousel';
import { trackAdClick } from '../../utils/analytics';

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
        className={className || (filled ? "text-amber-500" : "text-neutral-600")}
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

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
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
  console.log('VideoDetail video prop:', video);
  // Asegura que sources siempre sea un array
  const { id, title, category, rating, total_votes, good_votes, bad_votes, duration } = video;
  const sources = Array.isArray(video.sources) && video.sources.length > 0
    ? video.sources
    : [{ quality: 'default', url: video.page_url || video.url || '' }];
  
  useEffect(() => {
  console.log('[VideoDetail] useEffect para fetchLinks ejecutado, id:', id, 'page_url:', video.page_url);
    const scriptId = 'adManager-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = 'https://js.wpadmngr.com/static/adManager.js';
      script.setAttribute('data-admpid', '388725');
      document.body.appendChild(script);
    }
    return () => {
      const script = document.getElementById(scriptId);
      if (script) document.body.removeChild(script);
    };
  }, []);
  
  // Schema.org VideoObject y metadatos SEO - Agregar al head del documento
  useEffect(() => {
    // 1. Generar y agregar Schema.org JSON-LD
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = generateVideoSchema(video);
    schemaScript.id = `video-schema-${video.id}`;
    
    // Remove any existing schema for this video
    const existingSchema = document.getElementById(`video-schema-${video.id}`);
    if (existingSchema) {
      document.head.removeChild(existingSchema);
    }
    
    // Add new schema
    document.head.appendChild(schemaScript);
    
    // 2. Generar y agregar metadatos SEO
    const metadata = generateSeoMetadata(video);
    
    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Update title
    document.title = metadata.title;
    
    // Set meta description
    setMetaTag('description', metadata.description);
    
    // Set Open Graph tags
    setMetaTag('og:title', metadata.ogTitle, true);
    setMetaTag('og:description', metadata.ogDescription, true);
    setMetaTag('og:type', metadata.ogType, true);
    setMetaTag('og:url', metadata.ogUrl, true);
    setMetaTag('og:image', metadata.ogImage, true);
    setMetaTag('og:video:duration', metadata.ogVideoDuration, true);
    setMetaTag('og:site_name', 'PORNSTERS', true);
    
    // Set Twitter Card tags
    setMetaTag('twitter:card', metadata.twitterCard);
    setMetaTag('twitter:title', metadata.twitterTitle);
    setMetaTag('twitter:description', metadata.twitterDescription);
    setMetaTag('twitter:image', metadata.twitterImage);
    
    // Set adult content meta tags
    setMetaTag('rating', metadata.adultContent.rating);
    setMetaTag('audience', metadata.adultContent.audience);
    setMetaTag('content-rating', metadata.adultContent.contentRating);
    setMetaTag('safesearch', metadata.adultContent.safeSearch);
    setMetaTag('age-gate', metadata.adultContent.ageGate);
    setMetaTag('label', metadata.adultContent.label);
    
    // Set RTA (Restricted to Adults) label específico
    const rtaLabel = document.createElement('meta');
    rtaLabel.setAttribute('http-equiv', 'PICS-Label');
    rtaLabel.setAttribute('content', '(PICS-1.1 "http://www.classify.org/safesurf/" l r (SS~~000 1))');
    document.head.appendChild(rtaLabel);
    
    // Set clasificación adicional para motores de búsqueda
    setMetaTag('classification', 'adult');
    setMetaTag('subject', 'adult entertainment');
    
    console.log('[VideoDetail] Schema.org VideoObject added:', JSON.parse(schemaScript.textContent));
    console.log('[VideoDetail] SEO metadata updated:', metadata);
    
    // Cleanup when component unmounts or video changes
    return () => {
      const currentSchema = document.getElementById(`video-schema-${video.id}`);
      if (currentSchema && document.head.contains(currentSchema)) {
        document.head.removeChild(currentSchema);
      }
      
      // Reset title to default
      document.title = 'PORNSTERS';
      
      // Note: We don't remove meta tags on cleanup as they might be used by other components
    };
  }, [video]);
  
  // Agregar estilos CSS para la animación
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          border-color: rgba(255, 255, 255, 0.3);
        }
        50% {
          border-color: rgba(255, 255, 255, 0.8);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Obtener URLs de video haciendo POST a /api/selenium-scrape
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  useEffect(() => {
    // Este log confirma que el efecto se ejecuta al montar el componente
    console.log('[VideoDetail] useEffect de fetchLinks montado. video:', video);
    const fetchLinks = async () => {
      setLoadingLinks(true);
      setFetchError(null);
      try {
        const pageUrl = video.page_url || video.url;
        console.log('[VideoDetail] Iniciando fetch a /api/selenium-scrape con pageUrl:', pageUrl);
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
        console.log('[VideoDetail] Respuesta HTTP:', response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[VideoDetail] Error en la petición /api/selenium-scrape:', errorText);
          throw new Error('Error en la petición: ' + errorText);
        }
        const data = await response.json();
        console.log('[VideoDetail] Respuesta de /api/selenium-scrape:', data);
        if (Array.isArray(data.video_links)) {
          setVideoLinks(data.video_links);
          console.log('[VideoDetail] video_links recibidos:', data.video_links);
        } else {
          setFetchError('Respuesta inesperada del backend');
          console.error('[VideoDetail] Respuesta inesperada del backend:', data);
        }
      } catch (err: any) {
        setFetchError(err.message || 'Error desconocido');
        console.error('[VideoDetail] Error en fetchLinks:', err);
      } finally {
        setLoadingLinks(false);
        console.log('[VideoDetail] Estado final de videoLinks:', videoLinks);
      }
    };
    fetchLinks();
  }, [video, video.page_url, video.url, id]);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adOverlayStep, setAdOverlayStep] = useState(1); // 1: first ad, 2: second ad, 0: none
  const [adClicked, setAdClicked] = useState(false); // Estado para detectar click manual
  const [adHidden, setAdHidden] = useState(false); // Estado para ocultar completamente el anuncio
  const [showCloseButton, setShowCloseButton] = useState(false); // Estado para mostrar botón X
  const [adBannerClicked, setAdBannerClicked] = useState(false); // Estado para detectar click específico en el banner del anuncio
  const adContainerRef = useRef<HTMLDivElement>(null); // Ref para el contenedor del anuncio
  const [xPosition, setXPosition] = useState({ top: '50%', left: '50%' }); // Posición de la X frontal
  const [xPositionBack, setXPositionBack] = useState({ top: '50%', left: '50%' }); // Posición de la X trasera
  const [xPositionClose, setXPositionClose] = useState({ top: '50%', left: '50%' }); // Posición de la X inferior
  const [activeCloseButton, setActiveCloseButton] = useState(1); // Cuál X cierra el AD (1, 2, o 3)
  
  const [currentQuality, setCurrentQuality] = useState(sources[0]?.quality || 'default');
        const [validSourceUrl, setValidSourceUrl] = useState<string | null>(null);
        
        // Effect para resetear el estado del anuncio cada vez que cambia el video
        useEffect(() => {
            console.log('[VideoDetail] Nuevo video cargado, reseteando estado del anuncio para video ID:', id);
            setAdOverlayStep(1); // Reiniciar al primer anuncio
            setAdClicked(false); // Reset del estado de click
            setAdHidden(false); // Mostrar anuncio nuevamente
            setShowCloseButton(false); // Ocultar botón de cerrar
            setAdBannerClicked(false); // Reset del estado de click en banner
            
            // Posiciones fijas centradas para ambas X - una al lado de la otra
            setXPosition({
                top: '50%', // Centrada verticalmente
                left: '42%' // X frontal ligeramente a la izquierda del centro
            });
            
            setXPositionBack({
                top: '50%', // Centrada verticalmente  
                left: '58%' // X trasera ligeramente a la derecha del centro
            });
            
            // Tercera X centrada debajo de las otras dos (X que cierra el AD)
            setXPositionClose({
                top: '65%', // Debajo de las otras X
                left: '50%' // Centrada horizontalmente
            });
            
            // Seleccionar aleatoriamente cuál X será la que cierre el anuncio (1, 2, o 3)
            const randomActiveButton = Math.floor(Math.random() * 3) + 1;
            setActiveCloseButton(randomActiveButton);
            
            console.log('[VideoDetail] Posiciones de las 3 X aplicadas:');
            console.log('- X1 (izquierda):', { top: '50%', left: '42%' });
            console.log('- X2 (derecha):', { top: '50%', left: '58%' });
            console.log('- X3 (abajo centro):', { top: '65%', left: '50%' });
            console.log('- X activa para cerrar AD:', randomActiveButton);
        }, [id]); // Se ejecuta cada vez que cambia el ID del video
        
        // DEBUG: Log inicial de props video
        useEffect(() => {
            console.debug('[VideoDetail] video prop:', video);
            console.debug('[VideoDetail] adOverlayStep inicial:', adOverlayStep);
        }, [video]);
        
        // Effect para detectar cuando se carga el anuncio y buscar td colspan
        useEffect(() => {
            if (adOverlayStep > 0 && adContainerRef.current) {
                let attempts = 0;
                const maxAttempts = 15;
                
                const checkForTdColspan = () => {
                    const container = adContainerRef.current;
                    if (container) {
                        // Buscar específicamente td con colspan="2"
                        const tdColspan = container.querySelector('td[colspan="2"]');
                        
                        if (tdColspan) {
                            console.log('[VideoDetail] ✅ td colspan="2" encontrado!');
                            console.log('[VideoDetail] Contenido del td:', tdColspan.innerHTML);
                            
                            // Buscar el enlace dentro del td
                            const link = tdColspan.querySelector('a[href]') as HTMLAnchorElement;
                            if (link) {
                                console.log('[VideoDetail] ✅ Enlace dentro del td encontrado:', link.href);
                            }
                        } else if (attempts < maxAttempts) {
                            attempts++;
                            console.log(`[VideoDetail] ⏳ Buscando td colspan... intento ${attempts}/${maxAttempts}`);
                            
                            // Log de estructura actual para debug
                            if (attempts === 5) {
                                console.log('[VideoDetail] 🔍 Estructura HTML actual:', container.innerHTML.substring(0, 500) + '...');
                            }
                            
                            setTimeout(checkForTdColspan, 1000);
                        } else {
                            console.log('[VideoDetail] ❌ No se encontró td colspan después de múltiples intentos');
                            console.log('[VideoDetail] 📋 HTML completo del contenedor:', container.innerHTML);
                        }
                    }
                };
                
                // Empezar a verificar después de 2 segundos para dar tiempo al anuncio
                setTimeout(checkForTdColspan, 2000);
            }
        }, [adOverlayStep]);
  
  // Debug effect para el overlay
  useEffect(() => {
    console.log('[VideoDetail] Estado del anuncio - Step:', adOverlayStep, 'clicked:', adClicked, 'hidden:', adHidden, 'showClose:', showCloseButton, 'bannerClicked:', adBannerClicked);
  }, [adOverlayStep, adClicked, adHidden, showCloseButton, adBannerClicked]);
  
  // Efecto para detectar elementos del anuncio una vez cargado
  useEffect(() => {
    if (adContainerRef.current && adOverlayStep === 1) {
      let attempts = 0;
      const maxAttempts = 20; // Aumentamos los intentos
      
      const checkForAdElements = () => {
        attempts++;
        console.log(`[VideoDetail] Intento ${attempts}/${maxAttempts} - Detectando estructura del anuncio...`);
        
        const container = adContainerRef.current;
        if (!container) return;
        
        // Log de toda la estructura HTML del contenedor
        console.log('[VideoDetail] 📋 Estructura HTML del contenedor:', container.innerHTML.substring(0, 500));
        
        // Buscar diferentes tipos de elementos
        const elements = {
          tdColspan: container.querySelectorAll('td[colspan]'),
          allTds: container.querySelectorAll('td'),
          iframes: container.querySelectorAll('iframe'),
          links: container.querySelectorAll('a[href]'),
          images: container.querySelectorAll('img'),
          divs: container.querySelectorAll('div'),
          scripts: container.querySelectorAll('script')
        };
        
        console.log('[VideoDetail] 🔍 Elementos encontrados:');
        console.log('- td[colspan]:', elements.tdColspan.length);
        console.log('- td (total):', elements.allTds.length);
        console.log('- iframes:', elements.iframes.length);
        console.log('- enlaces:', elements.links.length);
        console.log('- imágenes:', elements.images.length);
        console.log('- divs:', elements.divs.length);
        console.log('- scripts:', elements.scripts.length);
        
        // Revisar cada td para ver sus atributos
        elements.allTds.forEach((td, index) => {
          const tdElement = td as HTMLElement;
          console.log(`[VideoDetail] TD ${index + 1}:`, {
            colspan: tdElement.getAttribute('colspan'),
            className: tdElement.className,
            id: tdElement.id,
            innerHTML: tdElement.innerHTML.substring(0, 100)
          });
        });
        
        // Revisar iframes
        elements.iframes.forEach((iframe, index) => {
          const iframeElement = iframe as HTMLIFrameElement;
          console.log(`[VideoDetail] IFRAME ${index + 1}:`, {
            src: iframeElement.src,
            id: iframeElement.id,
            className: iframeElement.className
          });
        });
        
        // Revisar enlaces
        elements.links.forEach((link, index) => {
          const linkElement = link as HTMLAnchorElement;
          console.log(`[VideoDetail] LINK ${index + 1}:`, {
            href: linkElement.href,
            target: linkElement.target,
            className: linkElement.className
          });
        });
        
        // Continuar buscando si no hemos agotado los intentos
        if (attempts < maxAttempts && 
            (elements.tdColspan.length === 0 && elements.allTds.length === 0 && elements.iframes.length === 0)) {
          setTimeout(checkForAdElements, 1000); // Aumentamos el intervalo
        } else {
          console.log('[VideoDetail] ✅ Detección completada o límite alcanzado');
        }
      };
      
      // Iniciar la detección después de un pequeño delay
      setTimeout(checkForAdElements, 2000); // Aumentamos el delay inicial
    }
  }, [adOverlayStep]); // Ejecutar cuando cambie el step del overlay
  
  // Effect para cerrar automáticamente el anuncio después de 12 segundos Y solo si se hizo clic en el banner
  useEffect(() => {
    if (adOverlayStep > 0 && !adHidden && adBannerClicked) {
      const timer = setTimeout(() => {
        if (!adHidden && adOverlayStep > 0 && adBannerClicked) {
          console.log('[VideoDetail] Cerrando anuncio automáticamente después de 12 segundos');
          setAdHidden(true);
          setAdOverlayStep(0);
        }
      }, 5000); // 5 segundos después del click en el banner
      
      return () => clearTimeout(timer);
    }
  }, [adOverlayStep, adHidden, adBannerClicked]);
  
  // Función para manejar clicks en las X (solo una cierra el anuncio)
  const handleXClick = (buttonNumber: number) => {
    if (buttonNumber === activeCloseButton) {
      // Esta es la X que cierra el anuncio
      console.log(`[VideoDetail] X${buttonNumber} es la correcta - cerrando anuncio`);
      trackAdClick(`close-button-${buttonNumber}`);
      handleAdClick(); // Llamar directamente a la función que cierra el anuncio
    } else {
      // Esta X abre el anuncio como las otras
      console.log(`[VideoDetail] X${buttonNumber} es falsa - abriendo anuncio`);
      trackAdClick(`fake-close-button-${buttonNumber}`);
      handleAdBannerClick({ preventDefault: () => {}, stopPropagation: () => {}, currentTarget: null } as any);
    }
  };
  
  // Función para manejar el click en la X central (que abre el anuncio)
  const handleAdBannerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[VideoDetail] Click detectado en X central del anuncio...');
    
    if (!adBannerClicked && adContainerRef.current) {
      console.log('[VideoDetail] Registrando click y buscando elemento de anuncio...');
      setAdBannerClicked(true);
      
      // Función para buscar en un elemento (incluyendo iframes)
      const searchInElement = (element: Element): HTMLElement | null => {
        // Buscar td colspan="2" directamente
        let tdElement = element.querySelector('td[colspan="2"]') as HTMLElement;
        if (tdElement) return tdElement;
        
        // Buscar en iframes
        const iframes = element.querySelectorAll('iframe');
        for (const iframe of iframes) {
          try {
            if (iframe.contentDocument || iframe.contentWindow) {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                tdElement = iframeDoc.querySelector('td[colspan="2"]') as HTMLElement;
                if (tdElement) return tdElement;
              }
            }
          } catch (error) {
            console.log('[VideoDetail] No se puede acceder al iframe (cross-origin):', error);
          }
        }
        
        return null;
      };
      
      // Buscar en el contenedor principal
      let targetElement = searchInElement(adContainerRef.current!);
      
      if (targetElement) {
        console.log('[VideoDetail] ✅ Elemento td colspan="2" encontrado!', targetElement);
        
        // Buscar el enlace dentro del td
        const linkElement = targetElement.querySelector('a[href]') as HTMLAnchorElement;
        
        if (linkElement) {
          console.log('[VideoDetail] ✅ Enlace encontrado dentro del td:', linkElement.href);
          console.log('[VideoDetail] 🎯 Abriendo enlace del anuncio...');
          
          // Abrir el enlace en una nueva pestaña
          window.open(linkElement.href, '_blank');
          
        } else {
          console.log('[VideoDetail] 🎯 No se encontró enlace, haciendo click directo en td...');
          targetElement.click();
        }
        
      } else {
        console.log('[VideoDetail] ❌ No se encontró elemento td colspan="2"');
        console.log('[VideoDetail] 🔍 Intentando buscar elementos alternativos...');
        
        // Búsqueda más amplia de elementos clickeables
        const alternatives = [
          adContainerRef.current?.querySelector('a[href*="juicyads"]'),
          adContainerRef.current?.querySelector('a[href*="getjuicy"]'),
          adContainerRef.current?.querySelector('a[target="_blank"]'),
          adContainerRef.current?.querySelector('img[alt]'),
          adContainerRef.current?.querySelector('td'),
          adContainerRef.current?.querySelector('a[href]'),
          // Buscar elementos que contengan enlaces de JuicyAds
          ...Array.from(adContainerRef.current?.querySelectorAll('*') || []).filter(el => {
            const element = el as HTMLElement;
            return element.innerHTML?.includes('juicyads') || 
                   element.innerHTML?.includes('getjuicy') ||
                   element.onclick !== null;
          })
        ].filter(Boolean);
        
        console.log('[VideoDetail] 📋 Elementos alternativos encontrados:', alternatives.length);
        
        for (let i = 0; i < alternatives.length; i++) {
          const element = alternatives[i] as HTMLElement;
          if (element) {
            console.log(`[VideoDetail] 🔄 Probando alternativa ${i + 1}:`, element.tagName, element.className, element.id);
            
            // Intentar abrir enlace
            if (element.tagName === 'A') {
              const link = element as HTMLAnchorElement;
              console.log('[VideoDetail] 🎯 Abriendo enlace:', link.href);
              window.open(link.href, '_blank');
              break;
            } else if (element.onclick || element.addEventListener) {
              console.log('[VideoDetail] 🎯 Haciendo click en elemento con evento');
              element.click();
              break;
            }
          }
        }
      }
      
      // Feedback visual - hacer que la X se vea presionada
      // (Código de animación removido para mantener X estática)
    }
  };
  
  // Función para manejar el click en el anuncio
  const handleAdClick = () => {
    console.log('[VideoDetail] Click detectado en overlay del anuncio');
    if (!adClicked) {
      setAdClicked(true);
      // Ocultar inmediatamente el overlay con transición
      setAdHidden(true);
      setShowCloseButton(false);
      // Después de un breve delay, cambiar el estado del overlay y permitir reproducción
      setTimeout(() => {
        console.log('[VideoDetail] Desbloqueando video después del click');
        setAdOverlayStep(0);
        // Intentar reproducir el video automáticamente si el usuario lo tenía pausado
        if (videoRef.current) {
          videoRef.current.play().catch(error => 
            console.log('[VideoDetail] Autoplay prevented:', error)
          );
        }
      }, 300);
    }
  };
  
  // Función para cerrar el anuncio con el botón X (solo funciona si se clickeó el banner)
  const handleCloseAd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se active el click del anuncio
    console.log('[VideoDetail] Intentando cerrar anuncio con botón X');
    
    if (adBannerClicked) {
      console.log('[VideoDetail] Banner fue clickeado previamente, cerrando anuncio');
      handleAdClick(); // Reutilizar la misma lógica de cierre
    } else {
      console.log('[VideoDetail] Banner NO fue clickeado, no se puede cerrar aún');
      // Opcional: mostrar un mensaje temporal al usuario
    }
  };
  
  // Detector de clicks en anuncios - requiere click en banner primero
  useEffect(() => {
    if (adOverlayStep > 0 && !adHidden) {
      // Reset del estado de click cuando cambia el overlay
      setAdClicked(false);
      console.log(`[VideoDetail] Overlay del anuncio activo - DEBE hacer click en banner primero, luego se cerrará automáticamente en 5 segundos`);
    }
  }, [adOverlayStep, adClicked, adHidden]);
  
  const [isQualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isVideoInBasket = basketItems.includes(String(id));

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
      if (adOverlayStep !== 0 && !adHidden) {
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
  }, [id, adOverlayStep, adHidden]);

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

  // Efecto para inicializar hls.js si el enlace es .m3u8
  useEffect(() => {
    const videoEl = videoRef.current;
    const src = videoLinks[videoLinks.length - 1];
    let hls: Hls | null = null;
    if (!videoEl || !src) return;
    if (src.endsWith('.m3u8')) {
      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = src;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoEl);
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('[VideoDetail] hls.js error', event, data);
        });
      } else {
        videoEl.src = '';
      }
    }
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoLinks]);

  // Effect para inyectar el script del ad en el contenedor ad-higherperformance
useEffect(() => {
  const container = document.getElementById('ad-higherperformance');
  if (container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    // Script que define atOptions
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `atOptions = {\n  'key' : '6c602961d3172a7e220adf64b7817d79',\n  'format' : 'iframe',\n  'height' : 300,\n  'width' : 160,\n  'params' : {}\n};`;
    container.appendChild(optionsScript);
    // Script que invoca el ad
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/6c602961d3172a7e220adf64b7817d79/invoke.js';
    invokeScript.async = true;
    container.appendChild(invokeScript);
  }
  return () => {
    const container = document.getElementById('ad-higherperformance');
    if (container) while (container.firstChild) container.removeChild(container.firstChild);
  };
}, [id]);

// Effect para inyectar el script del ad en el segundo contenedor ad-higherperformance-2
// Effect para inyectar el banner ad encima de los recommended videos
useEffect(() => {
  const container = document.getElementById('ad-banner-recommended');
  if (container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    // Script de configuración
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.text = `atOptions = {\n  'key' : '563dad183dda887ca6259642daaedbb9',\n  'format' : 'iframe',\n  'height' : 90,\n  'width' : 728,\n  'params' : {}\n};`;
    container.appendChild(optionsScript);
    // Script del proveedor
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/563dad183dda887ca6259642daaedbb9/invoke.js';
    invokeScript.async = true;
    container.appendChild(invokeScript);
  }
  return () => {
    const container = document.getElementById('ad-banner-recommended');
    if (container) while (container.firstChild) container.removeChild(container.firstChild);
  };
}, [id]);
useEffect(() => {
  const container2 = document.getElementById('ad-higherperformance-2');
  if (container2) {
    while (container2.firstChild) container2.removeChild(container2.firstChild);
    // Script que define atOptions
    const optionsScript2 = document.createElement('script');
    optionsScript2.type = 'text/javascript';
    optionsScript2.text = `atOptions = {\n  'key' : '6c602961d3172a7e220adf64b7817d79',\n  'format' : 'iframe',\n  'height' : 300,\n  'width' : 160,\n  'params' : {}\n};`;
    container2.appendChild(optionsScript2);
    // Script que invoca el ad
    const invokeScript2 = document.createElement('script');
    invokeScript2.type = 'text/javascript';
    invokeScript2.src = '//www.highperformanceformat.com/6c602961d3172a7e220adf64b7817d79/invoke.js';
    invokeScript2.async = true;
    container2.appendChild(invokeScript2);
  }
  return () => {
    const container2 = document.getElementById('ad-higherperformance-2');
    if (container2) while (container2.firstChild) container2.removeChild(container2.firstChild);
  };
}, [id]);

  return (
    <main className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-6">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors"
        >
          &larr; Back to videos
        </button>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
        <div className="lg:col-span-2">
          <div className="group relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl">
            {loadingLinks ? (
              <div className="flex items-center justify-center h-full">Loading...</div>
            ) : fetchError ? (
              <div className="flex items-center justify-center h-full text-red-600">{fetchError}</div>
            ) : videoLinks.length > 0 ? (
              <div className="relative w-full h-full">
                <video
                  id="main-video"
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
                  {/* Solo renderizar <source> si NO es .m3u8 */}
                  {videoLinks[videoLinks.length - 1] && !videoLinks[videoLinks.length - 1].endsWith('.m3u8') && (
                    <source src={videoLinks[videoLinks.length - 1]} type="video/mp4" />
                  )}
                  Your browser does not support the video tag.
                </video>
                {/* Si usas VideoAdManager para otro ad, déjalo. Si no, elimínalo */}
                {/* <VideoAdManager /> */}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">No se encontraron enlaces de video.</div>
            )}
          </div>
        </div>
  
        <div className="lg:col-span-1">
          <button 
            onClick={() => onCategorySelect(category)}
            className="inline-block bg-neutral-800 text-neutral-200 rounded-full px-3 py-1 text-xs font-semibold mb-3 hover:bg-neutral-700 transition-colors"
          >
            {(() => {
              let normalizedCategory = category.startsWith('/') ? category : '/' + category;
              let mapped = DICTIONARY_ENG[normalizedCategory]
                || DICTIONARY_ENG[normalizedCategory.replace(/\s+/g, '').toLowerCase()]
                || DICTIONARY_ENG[category]
                || DICTIONARY_ENG[category.replace(/\s+/g, '').toLowerCase()];
              return mapped || category;
            })()}
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4">{title}</h1>
  
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-400 mb-6 border-y border-neutral-800 py-4">
            <div className="flex items-center gap-2" title={`Rating: ${rating}`}> 
              <StarRating rating={rating} />
            </div>
            <div className="flex items-center gap-2">
              <span title="Votos buenos" className="text-green-600 flex items-center gap-1">👍<span>{formatShortCount(good_votes)}</span></span>
              <span title="Votos malos" className="text-red-600 flex items-center gap-1">👎<span>{formatShortCount(bad_votes)}</span></span>
            </div>
          </div>
  
          <div className="mt-6 flex gap-2">
            <button 
              onClick={() => onToggleBasketItem(String(id))}
              className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                isVideoInBasket 
                  ? 'border-neutral-600 bg-neutral-800' 
                  : 'border-neutral-700 hover:bg-neutral-800'
              }`}
              aria-label={isVideoInBasket ? "Remove from basket" : "Add to basket"}
            >
              {isVideoInBasket ? <BasketCheckIcon /> : <BasketAddIcon />}
              <span>{isVideoInBasket ? 'In Basket' : 'Add to Basket'}</span>
            </button>
          </div>
          {/* Aquí va el contenedor del ad, sin iframe ni script directo */}
          <div
            className="ad-higherperformance-pair mt-12 flex flex-row justify-center gap-6"
            style={{ marginTop: 48 }}
          >
            <div
              className="ad-higherperformance"
              id="ad-higherperformance"
              style={{ width: 160, height: 300 }}
            >
              {/* El ad se inyecta aquí por useEffect */}
            </div>
            <div
              className="ad-higherperformance"
              id="ad-higherperformance-2"
              style={{ width: 160, height: 300 }}
            >
              {/* El segundo ad se inyecta aquí por useEffect */}
            </div>
          </div>
        </div>
      </div>

    {/* Horizontal ad above related videos - removed */}
    <div className="mt-8 px-4 sm:px-0">
      {/* Ad space removed */}
    </div>

    {validRelated.length > 0 && (
      <>
        {/* Banner ad encima de los recommended videos */}
        <div
          id="ad-banner-recommended"
          style={{ width: 728, height: 90, margin: '32px auto 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          {/* El banner ad se inyecta aquí por useEffect */}
        </div>
        <div className="mt-8 border-t border-neutral-800 pt-6">
          <VideoCarousel 
            title="Related Videos"
            videos={validRelated}
            onVideoSelect={onVideoSelect}
            basketItems={basketItems}
            onToggleBasketItem={onToggleBasketItem}
          />
        </div>
      </>
    )}

      <div className="px-4 sm:px-0">
        {/* Ad space removed */}
      </div>
    </main>
  );
};
