


import React, { useEffect, useState, useRef } from 'react';
import { Video } from '../types';

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
    <div style={{ width: '100%', height: '100%' }}>
      {loadingLinks ? (
        <div style={{ color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando…</div>
      ) : fetchError ? (
        <div style={{ color: 'red', textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fetchError}</div>
      ) : videoLinks.length > 0 ? (
        <video
          ref={videoRef}
          key={videoLinks[videoLinks.length - 1] || 'no-link'}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, background: 'black', display: 'block' }}
          crossOrigin="anonymous"
          poster={video.thumbnail}
        >
          <source src={videoLinks[0]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{ color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No se encontraron enlaces de video.</div>
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
        background: 'black',
        zIndex: 9999,
      }}
      aria-modal="true"
      role="dialog"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Líneas blancas vertical y horizontal */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 2,
          height: '100%',
          background: 'white',
          transform: 'translateX(-1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '100%',
          height: 2,
          background: 'white',
          transform: 'translateY(-1px)',
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
        // Si no hay 4 videos, mostrar las X blancas como antes
        <svg
          width={windowSize.width}
          height={windowSize.height}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {quadrants.map((q, idx) => (
            <g key={idx}>
              <line
                x1={q.center.x - 24}
                y1={q.center.y - 24}
                x2={q.center.x + 24}
                y2={q.center.y + 24}
                stroke="white"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <line
                x1={q.center.x + 24}
                y1={q.center.y - 24}
                x2={q.center.x - 24}
                y2={q.center.y + 24}
                stroke="white"
                strokeWidth={4}
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
      )}

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: 24,
          zIndex: 10000,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
        aria-label="Cerrar Basket Multiplayer"
      >
        ✕
      </button>
    </div>
  );
};
