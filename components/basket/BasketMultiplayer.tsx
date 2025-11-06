


import React, { useEffect, useState, useRef } from 'react';
import { Video } from '../../types';

interface BasketMultiplayerProps {
  onClose: () => void;
  videos?: Video[];
}

// Subcomponente para cada reproductor, emulando VideoDetail
const VideoPlayerMultiplayer: React.FC<{ video: Video }> = ({ video }) => {
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoadingLinks(true);
      setFetchError(null);
      try {
        const pageUrl = video.page_url || (video as any).url;
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
  }, [video.page_url, video.id]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      {loadingLinks ? (
        <div className="w-full h-full flex items-center justify-center text-neutral-100 bg-neutral-950">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-100 mb-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      ) : fetchError ? (
        <div className="w-full h-full flex items-center justify-center text-red-400 bg-neutral-950">
          <div className="text-center p-4">
            <p className="text-sm">{fetchError}</p>
            <p className="text-xs opacity-70 mt-2">Error al cargar el video</p>
          </div>
        </div>
      ) : videoLinks.length > 0 ? (
        <video
          ref={videoRef}
          key={videoLinks[videoLinks.length - 1] || 'no-link'}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, background: '#0a0a0a', display: 'block' }}
          crossOrigin="anonymous"
          poster={video.thumbnail}
        >
          <source src={videoLinks[0]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-100 bg-neutral-950">
          <div className="text-center p-4">
            <p className="text-sm">No se encontraron enlaces</p>
            <p className="text-xs opacity-70 mt-2">Video no disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const BasketMultiplayer: React.FC<BasketMultiplayerProps> = ({ onClose, videos = [] }) => {
  const [hovered, setHovered] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    // ESC para cerrar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Coordenadas y tamaño de cada cuadrante
  const quadrants = [
    {
      x: 0,
      y: 0,
      width: windowSize.width / 2,
      height: windowSize.height / 2,
      center: { x: windowSize.width / 4, y: windowSize.height / 4 },
    },
    {
      x: windowSize.width / 2,
      y: 0,
      width: windowSize.width / 2,
      height: windowSize.height / 2,
      center: { x: (3 * windowSize.width) / 4, y: windowSize.height / 4 },
    },
    {
      x: 0,
      y: windowSize.height / 2,
      width: windowSize.width / 2,
      height: windowSize.height / 2,
      center: { x: windowSize.width / 4, y: (3 * windowSize.height) / 4 },
    },
    {
      x: windowSize.width / 2,
      y: windowSize.height / 2,
      width: windowSize.width / 2,
      height: windowSize.height / 2,
      center: { x: (3 * windowSize.width) / 4, y: (3 * windowSize.height) / 4 },
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#0a0a0a',
        zIndex: 9999,
      }}
      className="transition-all duration-300"
      aria-modal="true"
      role="dialog"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Líneas divisorias con efecto neon */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 2,
          height: '100%',
          background: '#ff2d55',
          transform: 'translateX(-1px)',
          boxShadow: '0 0 10px #ff2d55, 0 0 20px #ff2d55, 0 0 40px #ff2d55',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '100%',
          height: 2,
          background: '#ff2d55',
          transform: 'translateY(-1px)',
          boxShadow: '0 0 10px #ff2d55, 0 0 20px #ff2d55, 0 0 40px #ff2d55',
        }}
      />

      {/* Mostrar videos en el centro de cada cuadrante si hay al menos 4 */}
      {videos.length >= 4 ? (
        quadrants.slice(0, 4).map((q, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: q.x,
              top: q.y,
              width: q.width,
              height: q.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <VideoPlayerMultiplayer video={videos[idx]} />
          </div>
        ))
      ) : (
        // Si no hay 4 videos, mostrar las X con efecto neon
        <div className="w-full h-full flex items-center justify-center">
          <svg
            width={windowSize.width}
            height={windowSize.height}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {quadrants.map((q, idx) => (
              <g key={idx}>
                <line
                  x1={q.center.x - 32}
                  y1={q.center.y - 32}
                  x2={q.center.x + 32}
                  y2={q.center.y + 32}
                  stroke="#ff2d55"
                  strokeWidth={4}
                  strokeLinecap="round"
                  filter="url(#neonGlow)"
                  style={{ 
                    filter: 'drop-shadow(0 0 10px #ff2d55) drop-shadow(0 0 20px #ff2d55)',
                  }}
                />
                <line
                  x1={q.center.x + 32}
                  y1={q.center.y - 32}
                  x2={q.center.x - 32}
                  y2={q.center.y + 32}
                  stroke="#ff2d55"
                  strokeWidth={4}
                  strokeLinecap="round"
                  filter="url(#neonGlow)"
                  style={{ 
                    filter: 'drop-shadow(0 0 10px #ff2d55) drop-shadow(0 0 20px #ff2d55)',
                  }}
                />
                {/* Texto indicativo */}
                <text
                  x={q.center.x}
                  y={q.center.y + 60}
                  textAnchor="middle"
                  fill="#ff2d55"
                  fontSize="14"
                  fontWeight="bold"
                  style={{ 
                    filter: 'drop-shadow(0 0 5px #ff2d55)',
                    textShadow: '0 0 10px #ff2d55',
                  }}
                >
                  Agrega más videos
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 bg-neutral-900 text-white border-2 border-red-500 rounded-full flex items-center justify-center font-bold cursor-pointer text-xl transition-all duration-300 hover:bg-red-500/20 hover:text-red-400"
        style={{
          zIndex: 10000,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s, all 0.3s',
          pointerEvents: hovered ? 'auto' : 'none',
          boxShadow: '0 0 10px #ff2d55, 0 0 20px #ff2d55',
          filter: 'drop-shadow(0 0 5px #ff2d55)',
        }}
        aria-label="Cerrar Basket Multiplayer"
      >
        ✕
      </button>
    </div>
  );
};
