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
import { VideoDetail } from "./components/VideoDetail";
import { Basket } from "./components/Basket";

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

const PAGE_SIZE = 20;
type DurationFilter = 'all' | 'tiny' | 'short' | 'long';

export default function App() {
  // ---------------------------
  // State global de datos
  // ---------------------------
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // loading / error para el fetch
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---------------------------
  // State UI / filtros
  // ---------------------------
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<'home' | 'videos'>('home');

  // ---------------------------
  // Basket State
  // ---------------------------
  const [basketItems, setBasketItems] = useState<string[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  // cargar basket desde localStorage al montar
  useEffect(() => {
    try {
      const storedBasket = localStorage.getItem('videoBasket');
      if (storedBasket) {
        setBasketItems(JSON.parse(storedBasket));
      }
    } catch (error) {
      console.error("Failed to parse basket from localStorage", error);
    }
  }, []);

  // persistir basket cuando cambie
  useEffect(() => {
    localStorage.setItem('videoBasket', JSON.stringify(basketItems));
  }, [basketItems]);

  const toggleBasketItem = (videoId: string) => {
    setBasketItems(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const toggleBasketModal = () => setIsBasketOpen(prev => !prev);

  // ---------------------------
  // Fetch inicial a la API
  // ---------------------------
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

  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredVideos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredVideos, currentPage]);

  const totalPages = Math.ceil(filteredVideos.length / PAGE_SIZE);

  // ---------------------------
  // Navegación interna
  // ---------------------------
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setIsBasketOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (category: string) => {
    setActiveView('videos');
    setActiveCat(category);
    setSelectedVideo(null);
  };
  
  const handleViewChange = (view: 'home' | 'videos') => {
    setActiveView(view);
    setSelectedVideo(null);
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans">
      <Header
        onToggleSidebar={() => setShowSidebar((s) => !s)}
        query={query}
        setQuery={setQuery}
        activeView={activeView}
        onViewChange={handleViewChange}
        basketItemCount={basketItems.length}
        onToggleBasket={toggleBasketModal}
      />

      {selectedVideo ? (
        <VideoDetail 
          video={selectedVideo} 
          onBack={() => setSelectedVideo(null)} 
          allVideos={videos}
          onVideoSelect={handleVideoSelect}
          basketItems={basketItems}
          onToggleBasketItem={toggleBasketItem}
          onCategorySelect={handleCategorySelect}
        />
      ) : (
        <>
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
              <CategoryFilter 
                activeCat={activeCat} 
                setActiveCat={setActiveCat}
                categories={categories}        // <--- pasamos categorías dinámicas
              />

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
                      categories={categories}     // <--- también aquí
                    />
                    <div className="mt-6">
                      <AdSlot title="Ad Slot – 300x250" description="Vertical ad space" />
                    </div>
                  </div>
                </aside>

                <section className="lg:col-span-9" aria-label="Results">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">All Videos</h2>
                    <div className="flex items-center gap-2 text-sm opacity-75">
                      <span>{filteredVideos.length} results</span>
                    </div>
                  </div>

                  {paginatedVideos.length > 0 ? (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" role="list">
                      {paginatedVideos.map((v) => (
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
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                      <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">No videos found</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">Try adjusting your search or filters.</p>
                    </div>
                  )}

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
      />
    </div>
  );
}
