const BlackAdPlaceholderSquare: React.FC = () => (
  <div style={{ width: 250, height: 250, marginLeft: 32 }}>
    <JuicyAdsHorizontal adzoneId={1104274} width={250} height={250} />
  </div>
);
const BlackAdPlaceholderLarge: React.FC = () => (
  <div style={{ width: 908, height: 258 }}>
    <JuicyAdsHorizontal adzoneId={1104273} width={908} height={258} />
  </div>
);
import BlackAdPlaceholder from "./components/BlackAdPlaceholder";
import React, { useMemo, useState, useEffect } from "react";
import { initGA, trackPageView, trackVideoPlay, trackCategorySelect, trackSearch } from "./utils/analytics";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { VideoCard } from "./components/VideoCard";
import { AdSlot } from "./components/AdSlot";
import JuicyAdsHorizontal from "./components/JuicyAdsHorizontal";
import JuicyAdsVertical from "./components/JuicyAdsVertical";
import { CategoryFilter } from "./components/CategoryFilter";
import { Pagination } from "./components/Pagination";
import { Home } from "./components/Home";
import { fetchVideosAndCategories } from "./constants";
import { VideoCardSkeleton } from "./components/VideoCardSkeleton";
import { VirtualizedVideoGrid } from "./components/VirtualizedVideoGrid";
import { Video, Category } from "./types";
import { CATEGORY_LIST } from "./constants";
import { Basket } from "./components/Basket";
// Simple FilterIcon inline for toggle filters button
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);


type DurationFilter = 'all' | 'tiny' | 'short' | 'long';
const PAGE_SIZE = 36;

import { VideoDetail } from "./components/VideoDetail";
import { LiveStats } from "./components/LiveStats";

const App: React.FC = () => {
  // Inicializar Google Analytics
  useEffect(() => {
    initGA();
  }, []);

  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState(CATEGORY_LIST[0]);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // Paginación solo para la vista 'videos'
  // Paginación sincronizada con la URL
  const getPageFromUrl = () => {
    const search = window.location.search;
    const path = window.location.pathname;
    const params = new URLSearchParams(search);
    const page = parseInt(params.get('page') || '1', 10);
    return path.startsWith('/videos') && (!page || page < 1) ? 1 : (isNaN(page) || page < 1 ? 1 : page);
  };
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [pageSize] = useState(PAGE_SIZE);
  const [totalVideos, setTotalVideos] = useState(0);
  const [videosPage, setVideosPage] = useState<Video[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'videos'>('home');

  // ---------------------------
  // Basket State
  // ---------------------------
  const [basketItems, setBasketItems] = useState<string[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [basketFullPopup, setBasketFullPopup] = useState(false);

  // cargar basket desde localStorage al montar
  useEffect(() => {
    try {
      const storedBasket = localStorage.getItem('videoBasket');
      if (storedBasket) {
        // Solo IDs que existen en videos (evita videos fantasma)
        const parsed: string[] = JSON.parse(storedBasket);
        setBasketItems(parsed);
      }
    } catch (error) {
      console.error("Failed to parse basket from localStorage", error);
    }
  }, []);

  // Limpiar basket de IDs huérfanas cuando cambian los videos
  useEffect(() => {
    setBasketItems(prev => prev.filter(id => videos.some(v => v.id === id)));
  }, [videos]);

  // persistir basket cuando cambie
  useEffect(() => {
    localStorage.setItem('videoBasket', JSON.stringify(basketItems));
  }, [basketItems]);

  const toggleBasketItem = (videoId: string) => {
    setBasketItems(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        if (prev.length >= 4) {
          setBasketFullPopup(true);
          return prev;
        }
        return [...prev, videoId];
      }
    });
  };

  const toggleBasketModal = () => setIsBasketOpen(prev => !prev);

  // ---------------------------
  // Fetch inicial a la API
  // ---------------------------
  // Cargar todos los videos y categorías para Home
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetchVideosAndCategories()
      .then(({ videos, categories }) => {
        setVideos(videos);
        setCategories(categories);
      })
      .catch(err => {
        console.error("Error cargando datos desde API:", err);
        setLoadError("No se pudieron cargar los videos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch paginado SOLO cuando el usuario interactúa con el paginador
  useEffect(() => {
    if (activeView !== 'videos') return;
    setLoading(true);
    setLoadError(null);
    let url = `/api/videos?page=${currentPage}&size=${pageSize}`;
    if (activeCat && activeCat !== 'all') {
      url += `&category=${encodeURIComponent(activeCat)}`;
    }
    console.log('[DEBUG] Fetch triggered. currentPage:', currentPage, '| activeCat:', activeCat, '| URL:', url);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo obtener /api/videos');
        const data = await res.json();
        let allRawVideos;
        let totalCount = 0;
        if (Array.isArray(data.videos)) {
          allRawVideos = data.videos.filter(Boolean);
          totalCount = typeof data.total === 'number' ? data.total : allRawVideos.length;
        } else if (data && typeof data === 'object') {
          allRawVideos = Object.values(data).flat().filter(Boolean);
          totalCount = typeof data.total === 'number' ? data.total : allRawVideos.length;
        } else {
          allRawVideos = [];
          totalCount = 0;
        }
  console.log('[DEBUG] API response videos count:', allRawVideos.length, '| Mostrando solo estos videos en la vista paginada.');
  setVideosPage(allRawVideos);
  setTotalVideos(totalCount);
      })
      .catch((err) => {
        console.error("Error cargando datos desde API:", err);
        setLoadError("No se pudieron cargar los videos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeView, currentPage, pageSize, activeCat]);


  // ---------------------------
  // Helpers de filtrado/paginación
  // ---------------------------
  const filteredVideos = useMemo(() => {
    const getMinutes = (duration: string) => {
        const [min, sec] = duration.split(':').map(Number);
        return min + sec / 60;
    };

    // Filtrar primero
    const filtered = videos.filter((v) => {
      const matchesQuery = v.title.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCat === "all" ? true : v.category === activeCat;
      let matchesDuration = true;
      const minutes = getMinutes(v.duration);
      if (durationFilter === 'tiny') {
        matchesDuration = minutes <= 3;
      } else if (durationFilter === 'short') {
        matchesDuration = minutes > 3 && minutes <= 10;
      } else if (durationFilter === 'long') {
        matchesDuration = minutes > 10;
      }
      return matchesQuery && matchesCat && matchesDuration;
    });

    // Ordenar por visitas + likes - dislikes, luego por rating
    return filtered.sort((a, b) => {
      const scoreA = (a.views || 0) + (a.good_votes || 0) - (a.bad_votes || 0);
      const scoreB = (b.views || 0) + (b.good_votes || 0) - (b.bad_votes || 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Si empatan, más estrellas primero
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [videos, query, activeCat, durationFilter]);

  // resetear página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
    if (activeView === 'videos') {
      const params = new URLSearchParams(window.location.search);
      params.set('page', '1');
      window.history.replaceState({}, '', `/videos?${params.toString()}`);
    } else if (activeView === 'home') {
      window.history.replaceState({}, '', '/Home');
    }
  }, [query, activeCat, durationFilter, activeView]);

  // Sincronizar currentPage con la URL
  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(getPageFromUrl());
      // Cambiar vista según path
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/videos')) {
        setActiveView('videos');
      } else if (path === '/home' || path === '/') {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Actualizar la URL cuando cambia currentPage
  useEffect(() => {
    if (activeView === 'videos') {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(currentPage));
      window.history.replaceState({}, '', `/videos?${params.toString()}`);
    } else if (activeView === 'home') {
      window.history.replaceState({}, '', '/Home');
    }
  }, [currentPage, activeView]);

  // Solo para la vista 'videos', el paginado viene del backend
  const totalPages = activeView === 'videos' ? Math.ceil(totalVideos / pageSize) : 1;

  // ---------------------------
  // Navegación interna
  // ---------------------------
  // Handle video selection and update URL
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setIsBasketOpen(false);
    window.scrollTo(0, 0);
    // Push video ID to URL
    window.history.pushState({ videoId: video.id }, '', `?video=${video.id}`);
    
    // Rastrear visualización de video
    trackVideoPlay(video.id, video.title);
    trackPageView(`Video: ${video.title}`, window.location.href);
  };

  // Handle browser navigation (back/forward)
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('video');
      if (videoId) {
        const found = videos.find(v => v.id === videoId);
        if (found) {
          setSelectedVideo(found);
        } else {
          setSelectedVideo(null);
        }
      } else {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    // On mount, check if URL has video param
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('video');
    if (videoId) {
      const found = videos.find(v => v.id === videoId);
      if (found) setSelectedVideo(found);
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, [videos]);

  const handleCategorySelect = (category: string) => {
    setActiveView('videos');
    setActiveCat(category);
    setSelectedVideo(null);
    // Remove video param from URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('video')) {
      params.delete('video');
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
    }
    
    // Rastrear selección de categoría
    trackCategorySelect(category);
  };
  
  const handleViewChange = (view: 'home' | 'videos') => {
    setActiveView(view);
    setSelectedVideo(null);
    const params = new URLSearchParams(window.location.search);
    if (params.has('video')) {
      params.delete('video');
    }
    let newPath = '/';
    if (view === 'videos') {
      if (!params.get('page')) params.set('page', '1');
      newPath = '/videos';
      window.history.replaceState({}, '', `${newPath}${params.toString() ? '?' + params.toString() : ''}`);
    } else {
      // Home: limpiar todos los parámetros
      newPath = '/Home';
      window.history.replaceState({}, '', newPath);
    }
    
    // Rastrear cambio de vista
    trackPageView(view === 'home' ? 'Home' : 'Videos', window.location.href);
  };

  // ---------------------------
  // Render
  // ---------------------------

  // Estado de carga inicial o error de la API
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <p className="text-lg font-semibold">Cargando contenido…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">{loadError}</p>
          <p className="text-sm opacity-75">Intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', minHeight: '100vh' }}>
      <Header
        onToggleSidebar={() => setShowSidebar((s) => !s)}
        query={query}
        setQuery={setQuery}
        activeView={activeView}
        onViewChange={handleViewChange}
        basketItemCount={basketItems.length}
        onToggleBasket={toggleBasketModal}
      />

      {/* Navegación y bulletin bar */}
      {(activeView === 'home' || activeView === 'videos') && (
        <>
          {/* Navigation removed as per user request */}
          <style>{`
            @keyframes neonPulse {
              0%, 100% {
                text-shadow: 0 0 8px #ff2d55, 0 0 16px #ff2d55, 0 0 32px #ff2d55;
                color: #ff2d55;
              }
              50% {
                text-shadow: 0 0 8px #a259ff, 0 0 16px #a259ff, 0 0 32px #a259ff;
                color: #a259ff;
              }
            }
          `}</style>
          <div className={`${activeView === 'videos' ? 'mb-6' : ''}`} style={{width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', zIndex: 50}}>
            <div
              className="transition-transform duration-200 ease-in-out cursor-pointer flex items-center justify-center py-3 text-center text-base font-extrabold tracking-wide select-none shadow-lg bg-black/90 neon-bulletin-glow"
              style={{
                width: '100%',
                animation: 'neonPulse 1.5s infinite alternate',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{width: '100%', textAlign: 'center', display: 'block'}}>
                Enjoy 4x more. Try our Multiplay Effect!
              </span>
            </div>
          </div>
        </>
      )}

      {selectedVideo ? (
        <VideoDetail 
          video={selectedVideo} 
          onBack={() => {
            setSelectedVideo(null);
            // Remove video param from URL
            const params = new URLSearchParams(window.location.search);
            if (params.has('video')) {
              params.delete('video');
              window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
            }
          }}
          relatedVideos={videos}
          onVideoSelect={handleVideoSelect}
          basketItems={basketItems}
          onToggleBasketItem={toggleBasketItem}
          onCategorySelect={handleCategorySelect}
        />
      ) : (
        <>
          {/* ...existing code... */}

          {activeView === 'home' && (
            <Home 
              videos={videos} 
              onVideoSelect={handleVideoSelect} 
              basketItems={basketItems}
              onToggleBasketItem={toggleBasketItem}
              onCategorySelect={handleCategorySelect}
            />
          )}

          {/* No progressive loading logic here */}
          {activeView === 'videos' && (
            <>
              <main className="w-full grid grid-cols-1 gap-4 xl:grid-cols-12">
                <aside
                  className={`xl:col-span-2 transition-transform duration-300 ease-in-out ${
                    showSidebar ? "block" : "hidden xl:block"
                  } ml-2 md:ml-4 xl:ml-6`}
                  aria-label="Sidebar navigation"
                >
                  <div className="lg:sticky lg:top-28">
                    <Sidebar 
                      onCategorySelect={handleCategorySelect} 
                      activeDurationFilter={durationFilter}
                      onDurationFilterChange={setDurationFilter}
                      categories={categories}
                      filteredVideos={videosPage}
                    />
                  </div>
                </aside>

                <section className="xl:col-span-8 lg:col-span-9" aria-label="Results">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">Videos por categoría</h2>
                  </div>
                  {activeView === 'videos' && totalPages > 1 && videosPage.length > 0 && (
                    <div className="mb-4">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                  {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i}><VideoCardSkeleton /></div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ width: '100%' }}>
                      <VirtualizedVideoGrid
                        videos={videosPage}
                        onVideoSelect={handleVideoSelect}
                        basketItems={basketItems}
                        onToggleBasketItem={toggleBasketItem}
                        columns={6}
                        rowHeight={340}
                      />
                    </div>
                  )}
                  {activeView === 'videos' && totalPages > 1 && videosPage.length > 0 && (
                    <>
                      <div className="mt-1">
                        <Pagination 
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                      {/* White grid for ad below the video grid */}
                      <div className="w-full rounded-xl shadow-lg h-[400px] flex items-center pl-8" style={{ background: 'transparent' }}>
                        <BlackAdPlaceholderLarge />
                        <BlackAdPlaceholderSquare />
                      </div>
                    </>
                  )}
                  {activeView === 'videos' && videosPage.length === 0 && !loading && (
                    <div className="text-center text-neutral-500 py-12">No hay videos para mostrar.</div>
                  )}
                </section>

                {/* Black 160x600 ad placeholder in its own right column, fixed at top */}
                <div className="hidden xl:flex xl:col-span-2" style={{ marginLeft: '8px', marginRight: '8px' }}>
                  <div style={{ position: 'sticky', top: 32, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <BlackAdPlaceholder />
                    <BlackAdPlaceholder />
                    <BlackAdPlaceholder />
                    <BlackAdPlaceholder />
                  </div>
                </div>
                {/* Responsive: show ad below grid on mobile/tablet */}
                <div className="flex xl:hidden w-full justify-center my-4">
                  <BlackAdPlaceholder />
                </div>
              </main>
              <button
                onClick={() => setShowSidebar((s) => !s)}
                className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm shadow-lg hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 lg:hidden"
                aria-label="Toggle filters"
              >
                <FilterIcon />
                Filters
              </button>
            </>
          )}
        </>
      )}

      <Footer />
      <Basket
        isOpen={isBasketOpen}
        onClose={toggleBasketModal}
        basketItems={basketItems}
        allVideos={videos}
        onToggleBasketItem={toggleBasketItem}
        onVideoSelect={handleVideoSelect}
        onClearBasket={() => setBasketItems([])}
      />
      {basketFullPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 20000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setBasketFullPopup(false)}
        >
          <div
            style={{
              background: 'white',
              color: 'black',
              borderRadius: 12,
              padding: '32px 40px',
              fontSize: 20,
              fontWeight: 'bold',
              boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)',
              minWidth: 320,
              textAlign: 'center',
            }}
          >
            El basket ya está lleno (máx. 4 videos)
            <br />
            <button
              style={{
                marginTop: 24,
                background: '#222',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 24px',
                fontSize: 18,
                cursor: 'pointer',
              }}
              onClick={() => setBasketFullPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {/* Componente de estadísticas en tiempo real */}
      <LiveStats />
    </div>
  );
}

export default App;
