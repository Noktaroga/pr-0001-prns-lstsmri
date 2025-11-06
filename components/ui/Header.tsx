import React from 'react';
import { PopupNews } from './popup-news';
import { trackSearch } from '../../utils/analytics';

interface HeaderProps {
  onToggleSidebar: () => void;
  query: string;
  setQuery: (v: string) => void;
  activeView: 'home' | 'videos';
  onViewChange: (view: 'home' | 'videos') => void;
  basketItemCount: number;
  onToggleBasket: () => void;
  onSearch: (searchTerm: string) => void; // Nueva prop para manejar la búsqueda
  t: (key: string) => string;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const BasketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"></path>
        <path d="M18 10h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path>
        <path d="M14 18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12"></path>
        <path d="M10 22h4"></path>
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, query, setQuery, activeView, onViewChange, basketItemCount, onToggleBasket, onSearch, t }) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLogoPopup, setShowLogoPopup] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // El input usa el estado global query directamente
  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  // Disparar búsqueda usando el valor global
  const handleSearch = () => {
    const trimmedSearch = query.trim();
    onSearch(trimmedSearch);
    if (trimmedSearch.length > 2) {
      trackSearch(trimmedSearch);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Manejar shortcut de búsqueda con "/"
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target === document.body) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ya no es necesario sincronizar searchInput con query

  const navButtonClasses = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const activeNavButtonClasses = "bg-neutral-800";
  const inactiveNavButtonClasses = "hover:bg-neutral-800/50";

  // Ref to trigger highlight in basket
  // Use window event to communicate with Basket
  const handleMultiplayClick = () => {
    // Open basket
    onToggleBasket();
    // Dispatch custom event to trigger highlight
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('highlight-basket-multiplayer'));
    }, 0);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 text-sm hover:bg-neutral-800 sm:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* Sidebar toggle for videos view - desktop only */}
          {activeView === 'videos' && (
            <button
              onClick={onToggleSidebar}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 text-sm hover:bg-neutral-800 xl:hidden"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          )}

          <button
            type="button"
            className="inline-flex items-center focus:outline-none"
            onClick={() => setShowLogoPopup(true)}
            style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
          >
            <img src="/logo.png" alt="Logo" className="h-14 w-15 object-contain" />
          </button>
        <PopupNews open={showLogoPopup} onClose={() => setShowLogoPopup(false)} />

          {/* Mobile search */}
          <div className="relative flex items-center sm:hidden flex-1 max-w-[200px]">
            <input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('search')}
              className="w-full rounded-l-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-500 hover:border-neutral-400 focus:border-white"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md border border-l-0 border-purple-600 hover:border-purple-700 transition-colors"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden items-center gap-2 sm:flex ml-4">
            <button 
              onClick={() => onViewChange('home')}
              className={`${navButtonClasses} ${activeView === 'home' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              {t('home')}
            </button>
            <button 
              onClick={() => onViewChange('videos')}
              className={`${navButtonClasses} ${activeView === 'videos' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
            >
              Videos
            </button>
            <div className="relative flex items-center">
                <style>{`
                  @keyframes neonRedPulse {
                    0%, 100% {
                      box-shadow: 0 0 6px #ff2d55, 0 0 12px #ff2d55, 0 0 24px #ff2d55;
                      color: #fff;
                    }
                    50% {
                      box-shadow: 0 0 12px #ff2d55, 0 0 24px #ff2d55, 0 0 48px #ff2d55;
                      color: #fff;
                    }
                  }
                  .neon-multiplay-btn {
                    background: #23272f !important;
                    box-shadow: 0 0 8px #fff, 0 0 16px #fff, 0 0 2px #ff2d55;
                    border: 2px solid #fff3;
                    position: relative;
                  }
                  .neon-multiplay-badge {
                    background: #ff2d55 !important;
                    color: #fff !important;
                    border: 2px solid #fff !important;
                    box-shadow: 0 0 8px #fff, 0 0 16px #fff, 0 0 24px #ff2d55;
                    animation: neonRedPulse 1.2s infinite alternate;
                    text-shadow: 0 0 6px #ff2d55, 0 0 12px #ff2d55;
                  }
                `}</style>
                <button
                  className={navButtonClasses + ' neon-multiplay-btn ml-2 text-white hover:bg-neutral-800'}
                  style={{ position: 'relative' }}
                  type="button"
                  onClick={handleMultiplayClick}
                >
                  Multiplay
                  <span
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 neon-multiplay-badge text-xs font-bold rounded px-2 py-0.5"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    New
                  </span>
                </button>
            </div>
          </nav>

          <div className="flex-grow hidden sm:block"></div>

          {/* Desktop search */}
          <div className="relative hidden items-center sm:flex">
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('search')}
              className="w-56 rounded-l-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-500 hover:border-neutral-400 focus:border-white"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md border border-l-0 border-purple-600 hover:border-purple-700 transition-colors flex items-center"
              aria-label="Search"
              style={{
                boxShadow: '0 0 5px rgba(147, 51, 234, 0.3)',
              }}
            >
              <SearchIcon />
            </button>
            <kbd className="pointer-events-none absolute right-14 rounded border border-neutral-700 bg-neutral-800 px-1.5 text-[11px] text-neutral-400">
              /
            </kbd>
          </div>

          <button 
            onClick={onToggleBasket}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 text-sm hover:bg-neutral-800"
            aria-label="Open my basket"
          >
            <BasketIcon />
            {basketItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {basketItemCount}
              </span>
            )}
          </button>

          {/* Removed Sign in and Upload buttons */}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          {/* Menu panel */}
          <div className="absolute top-0 left-0 right-0 bg-neutral-950 border-b border-neutral-800 shadow-xl">
            <div className="p-4 space-y-4">
              {/* Navigation */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    onViewChange('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeView === 'home' ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  {t('home')}
                </button>
                <button 
                  onClick={() => {
                    onViewChange('videos');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeView === 'videos' ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  Videos
                </button>
                {/* Multiplay button */}
                <button
                  className="w-full text-left neon-multiplay-btn text-white hover:bg-neutral-800 rounded-md px-3 py-2 text-sm font-medium transition-colors relative"
                  type="button"
                  onClick={() => {
                    handleMultiplayClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Multiplay
                  <span
                    className="absolute top-1 right-2 neon-multiplay-badge text-xs font-bold rounded px-2 py-0.5"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    New
                  </span>
                </button>
              </div>

              {/* Sidebar toggle for videos (mobile) */}
              {activeView === 'videos' && (
                <div className="border-t border-neutral-800 pt-4">
                  <button
                    onClick={() => {
                      onToggleSidebar();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left rounded-md px-3 py-2 text-sm font-medium hover:bg-neutral-800/50 transition-colors"
                  >
                    Toggle Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};