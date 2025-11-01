import React, { useMemo, useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { VideoCard } from "./components/VideoCard";
import { AdSlot } from "./components/AdSlot";
import { CategoryFilter } from "./components/CategoryFilter";
import { Pagination } from "./components/Pagination";
import { Home } from "./components/Home";
import { fetchVideosAndCategories } from "./constants";
import { Video, Category } from "./types";
import { Basket } from "./components/Basket";
// Simple FilterIcon inline for toggle filters button
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);


type DurationFilter = 'all' | 'tiny' | 'short' | 'long';
const PAGE_SIZE = 20;

import { VideoDetail } from "./components/VideoDetail";

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  // Paginación solo para la vista 'videos'
  const [currentPage, setCurrentPage] = useState(1);
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

  // Fetch paginado SOLO para la vista 'videos'
  useEffect(() => {
    if (activeView !== 'videos') return;
    setLoading(true);
    setLoadError(null);
    let url = `/api/videos?page=${currentPage}&size=${pageSize}`;
    if (activeCat && activeCat !== 'all') {
      url += `&category=${encodeURIComponent(activeCat)}`;
    }
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo obtener /api/videos');
        const data = await res.json();
        setVideosPage(data.videos);
        setTotalVideos(data.total);
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
  }, [query, activeCat, durationFilter]);

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
    // Fetch related videos for this category
    fetch(`/api/videos?page=1&size=12&category=${encodeURIComponent(video.category)}`)
      .then(res => res.ok ? res.json() : Promise.reject('No se pudo obtener /api/videos'))
      .then(data => {
        const rel = (data.videos || []).filter((v: any) => v.id !== video.id);
        setRelatedVideos(rel);
      })
      .catch(() => setRelatedVideos([]));
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
  };
  
  const handleViewChange = (view: 'home' | 'videos') => {
    setActiveView(view);
    setSelectedVideo(null);
    // Remove video param from URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('video')) {
      params.delete('video');
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
    }
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
  <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <Header
        onToggleSidebar={() => setShowSidebar((s) => !s)}
        query={query}
        setQuery={setQuery}
        activeView={activeView}
        onViewChange={handleViewChange}
        basketItemCount={basketItems.length}
        onToggleBasket={toggleBasketModal}
      />

      {/* Neon animated bulletin bar (alternates between red and purple) */}
      {(activeView === 'home' || activeView === 'videos') && (
        <>
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
          relatedVideos={relatedVideos}
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

          {activeView === 'videos' && (
            <>
              <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
                <aside
                  className={`lg:col-span-3 transition-transform duration-300 ease-in-out ${
                    showSidebar ? "block" : "hidden lg:block"
                  }`}
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
                    <div className="mt-6">
                      <AdSlot title="Ad Slot – 300x250" description="Vertical ad space" />
                    </div>
                  </div>
                </aside>

                <section className="lg:col-span-9" aria-label="Results">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">Videos por categoría</h2>
                  </div>
                  {activeCat === 'all'
                    ? categories
                        .filter(cat => cat.value !== 'all')
                        .map(cat => {
                          // Use strict category value match
                          const catVideos = videosPage.filter(v => (v.category || '').toLowerCase() === (cat.value || '').toLowerCase());
                          if (catVideos.length === 0) return null;
                          return (
                            <div key={cat.value} className="mb-10">
                              <h3 className="text-lg font-bold mb-3 px-2 text-blue-700 dark:text-blue-300">{cat.label}</h3>
                              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" role="list">
                                {catVideos.map((v) => (
                                  <li key={v.id}>
                                    <VideoCard
                                      video={v}
                                      onClick={() => handleVideoSelect(v)}
                                      isInBasket={basketItems.includes(v.id)}
                                      onToggleBasketItem={toggleBasketItem}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })
                    : (() => {
                        const cat = categories.find(c => c.value === activeCat);
                        if (!cat) return null;
                        // Use strict category value match
                        const catVideos = videosPage.filter(v => (v.category || '').toLowerCase() === (cat.value || '').toLowerCase());
                        if (catVideos.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center h-64 text-center bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">No videos found</p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-500">Try adjusting your search or filters.</p>
                            </div>
                          );
                        }
                        return (
                          <div key={cat.value} className="mb-10">
                            <h3 className="text-lg font-bold mb-3 px-2 text-blue-700 dark:text-blue-300">{cat.label}</h3>
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" role="list">
                              {catVideos.map((v) => (
                                <li key={v.id}>
                                  <VideoCard
                                    video={v}
                                    onClick={() => handleVideoSelect(v)}
                                    isInBasket={basketItems.includes(v.id)}
                                    onToggleBasketItem={toggleBasketItem}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()
                  }
                  <div className="mt-6">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                  </div>
                  <div className="mt-8">
                    <AdSlot title="Ad Slot – 728x90" description="Horizontal ad space" />
                  </div>
                </section>
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
    </div>
  );
}

export default App;
