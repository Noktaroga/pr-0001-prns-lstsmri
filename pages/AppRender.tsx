import React from 'react';
import { Header } from '../components/ui/Header';
import { Footer } from '../components/ui/Footer';
import { Basket } from '../components/basket/Basket';
import { Home } from '../components/utils/Home';
import { VideoDetail } from '../components/video/VideoDetail';
import { Sidebar } from '../components/ui/Sidebar';
import { Pagination } from '../components/ui/Pagination';
import { VideoCardSkeleton } from '../components/video/VideoCardSkeleton';
import { VirtualizedVideoGrid } from '../components/video/VirtualizedVideoGrid';
import { BlackAdPlaceholderLarge, BlackAdPlaceholderSquare } from './AppAds';

export function AppMainRender(props: any) {
  const {
    t,
    query,
    setQuery,
    activeView,
    onViewChange,
    basketItems,
    toggleBasketModal,
    videos,
    selectedVideo,
    setSelectedVideo,
    categories,
    activeCat,
    setActiveCat,
    durationFilter,
    setDurationFilter,
    showSidebar,
    setShowSidebar,
    activeSearchQuery,
    setActiveSearchQuery,
    searchType,
    setSearchType,
    loading,
    loadingVideoFromUrl,
    loadError,
    currentPage,
    setCurrentPage,
    pageSize,
    totalVideos,
    videosPage,
    setVideosPage,
    helpers,
    ads,
    isBasketOpen,
    basketFullPopup,
    setBasketFullPopup,
    toggleBasketItem,
    onVideoSelect,
    setBasketItems,
    finalDisplayVideos,
    totalPages,
    ...rest
  } = props;

  // Estado de carga inicial o error de la API
  if (loading && !loadingVideoFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <p className="text-lg font-semibold">Loading…</p>
      </div>
    );
  }

  // Loading específico para video desde URL
  if (loadingVideoFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Loading...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">{loadError}</p>
          <p className="text-sm opacity-75">Intenta recargar la página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <Header
        onToggleSidebar={() => setShowSidebar((s: boolean) => !s)}
        query={query}
        setQuery={setQuery}
        activeView={activeView}
        onViewChange={onViewChange}
        basketItemCount={basketItems.length}
        onToggleBasket={toggleBasketModal}
    onSearch={rest.handleSearch}
        t={t}
      />
      {/* Main content wrapper - flex-grow pushes footer to bottom */}
      <div className="flex-1">
        {/* Bulletin bar and neon styles */}
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
            <div className={`${activeView === 'videos' ? 'mb-6' : ''}`} style={{width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', zIndex: 30}}>
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
        {/* Main content logic */}
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
            onVideoSelect={onVideoSelect}
            basketItems={basketItems}
            onToggleBasketItem={toggleBasketItem}
            onCategorySelect={rest.handleCategorySelect}
          />
        ) : (
          <>
            {activeView === 'home' && (
              <Home 
                videos={videos} 
                onVideoSelect={onVideoSelect} 
                basketItems={basketItems}
                onToggleBasketItem={toggleBasketItem}
                onCategorySelect={rest.handleCategorySelect}
              />
            )}
            {activeView === 'videos' && (
              <>
                <main className="w-full max-w-full grid grid-cols-1 gap-4 xl:grid-cols-12 overflow-hidden">
                  {/* Mobile sidebar overlay */}
                  {showSidebar && (
                    <div className="fixed inset-0 z-50 xl:hidden">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)}></div>
                      <div className="absolute left-0 top-0 h-full w-80 bg-neutral-950 shadow-xl overflow-y-auto">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Filters</h2>
                            <button onClick={() => setShowSidebar(false)} className="p-2 rounded-md hover:bg-neutral-800" aria-label="Close sidebar">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <Sidebar 
                            onCategorySelect={(category) => {
                              rest.handleCategorySelect(category);
                              setCurrentPage(1);
                              setShowSidebar(false);
                            }}
                            activeDurationFilter={durationFilter}
                            onDurationFilterChange={(filter) => {
                              setDurationFilter(filter);
                              setCurrentPage(1);
                              setShowSidebar(false);
                            }}
                            categories={categories}
                            filteredVideos={finalDisplayVideos}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Desktop sidebar */}
                  <aside className="hidden xl:block xl:col-span-2 ml-2 md:ml-4 xl:ml-6" aria-label="Sidebar navigation">
                    <div className="lg:sticky lg:top-28">
                      <Sidebar 
                        onCategorySelect={(category) => {
                          rest.handleCategorySelect(category);
                          setCurrentPage(1);
                        }}
                        activeDurationFilter={durationFilter}
                        onDurationFilterChange={(filter) => {
                          setDurationFilter(filter);
                          setCurrentPage(1);
                        }}
                        categories={categories}
                        filteredVideos={finalDisplayVideos}
                      />
                    </div>
                  </aside>
                  <section className="xl:col-span-8 lg:col-span-9 min-w-0 w-full" aria-label="Results">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">
                          {activeSearchQuery ? `Results for "${activeSearchQuery}"` : 'Videos by category'}
                        </h2>
                        {activeSearchQuery && (
                          <button onClick={() => { setActiveSearchQuery(''); setQuery(''); setSearchType(null); }} className="px-3 py-1 text-xs rounded-md border border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300" style={{ boxShadow: '0 0 5px rgba(239, 68, 68, 0.3)' }}>
                            Clear search
                          </button>
                        )}
                      </div>
                    </div>
                    {activeView === 'videos' && totalPages > 1 && (
                      <div className="mb-4">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                      </div>
                    )}
                    {loading ? (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i}><VideoCardSkeleton /></div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ width: '100%' }}>
                        <VirtualizedVideoGrid
                          videos={finalDisplayVideos}
                          onVideoSelect={onVideoSelect}
                          basketItems={basketItems}
                          onToggleBasketItem={toggleBasketItem}
                          columns={6}
                          rowHeight={340}
                        />
                      </div>
                    )}
                    {activeView === 'videos' && totalPages > 1 && (
                      <>
                        <div className="mt-1">
                          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                        <div className="w-full rounded-xl shadow-lg min-h-[250px] lg:h-[400px] flex items-center justify-center lg:justify-start lg:pl-8 overflow-hidden" style={{ background: 'transparent' }}>
                          <BlackAdPlaceholderLarge />
                          <BlackAdPlaceholderSquare />
                        </div>
                      </>
                    )}
                    {activeView === 'videos' && finalDisplayVideos.length === 0 && !loading && (
                      <div className="text-center text-neutral-500 py-12">
                        {activeSearchQuery ? (
                          <div className="space-y-4">
                            <p className="text-lg">No results found for "{activeSearchQuery}"</p>
                            <p className="text-sm">Try other search terms or explore our categories.</p>
                            <button onClick={() => { setActiveSearchQuery(''); setQuery(''); setSearchType(null); }} className="px-4 py-2 text-sm rounded-md border border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300" style={{ boxShadow: '0 0 5px rgba(147, 51, 234, 0.3)' }}>
                              See all videos
                            </button>
                          </div>
                        ) : (
                          'No videos to display.'
                        )}
                      </div>
                    )}
                  </section>
                  <div className="hidden xl:flex xl:col-span-2" style={{ marginLeft: '8px', marginRight: '8px' }}>
                    <div style={{ position: 'sticky', top: 32, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* BlackAdPlaceholder from original App.tsx, can be added if needed */}
                      <BlackAdPlaceholderLarge />
                      <BlackAdPlaceholderSquare />
                    </div>
                  </div>
                  <div className="flex xl:hidden w-full justify-center my-4">
                    <BlackAdPlaceholderLarge />
                  </div>
                </main>
                <button onClick={() => setShowSidebar((s: boolean) => !s)} className="fixed bottom-8 right-8 inline-flex items-center gap-3 rounded-full border-2 border-pink-500 bg-black px-6 py-4 text-lg shadow-2xl xl:hidden neon-filters-btn" aria-label="Toggle filters" style={{ boxShadow: '0 0 24px #ff2d55, 0 0 48px #a259ff', textShadow: '0 0 8px #ff2d55, 0 0 16px #a259ff', color: '#ff2d55', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  <span style={{ filter: 'drop-shadow(0 0 6px #ff2d55)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff2d55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </span>
                  <span style={{ color: '#ff2d55', textShadow: '0 0 8px #ff2d55, 0 0 16px #a259ff' }}>Filters</span>
                </button>
              </>
            )}
          </>
        )}
      </div>
      <Footer />
      <Basket
        isOpen={isBasketOpen}
        onClose={toggleBasketModal}
        basketItems={basketItems}
        allVideos={
          // Si hay un video seleccionado y su id está en el basket pero no en videos, lo agregamos
          selectedVideo && basketItems.includes(String(selectedVideo.id)) && !videos.some(v => String(v.id) === String(selectedVideo.id))
            ? [...videos, selectedVideo]
            : videos
        }
        onToggleBasketItem={toggleBasketItem}
        onVideoSelect={onVideoSelect}
        onClearBasket={() => setBasketItems([])}
      />
      {basketFullPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setBasketFullPopup(false)}>
          <div style={{ background: 'white', color: 'black', borderRadius: 12, padding: '32px 40px', fontSize: 20, fontWeight: 'bold', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.2)', minWidth: 320, textAlign: 'center' }}>
            El basket ya está lleno (máx. 4 videos)
            <br />
            <button style={{ marginTop: 24, background: '#222', color: 'white', border: 'none', borderRadius: 8, padding: '8px 24px', fontSize: 18, cursor: 'pointer' }} onClick={() => setBasketFullPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
