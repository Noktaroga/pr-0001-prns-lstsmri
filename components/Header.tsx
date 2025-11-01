import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  query: string;
  setQuery: (v: string) => void;
  activeView: 'home' | 'videos';
  onViewChange: (view: 'home' | 'videos') => void;
  basketItemCount: number;
  onToggleBasket: () => void;
}

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
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


export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, query, setQuery, activeView, onViewChange, basketItemCount, onToggleBasket }) => {
  const [lang, setLang] = React.useState<'ES' | 'EN'>('ES');

  const navButtonClasses = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const activeNavButtonClasses = "bg-neutral-100 dark:bg-neutral-800";
  const inactiveNavButtonClasses = "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50";

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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        <a href="#" className="inline-flex items-center">
          <img src="/logo.png" alt="Logo" className="h-14 w-15 object-contain" />
        </a>
        
        <nav className="hidden items-center gap-2 lg:flex ml-4">
          <button 
            onClick={() => onViewChange('home')}
            className={`${navButtonClasses} ${activeView === 'home' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
          >
            Home
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

        <div className="flex-grow"></div>

        <label className="relative hidden items-center sm:flex">
          <span className="sr-only">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-56 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:border-white"
          />
          <kbd className="pointer-events-none absolute right-2 rounded border border-neutral-300 bg-neutral-50 px-1.5 text-[11px] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            /
          </kbd>
        </label>

        {/* Language buttons */}
        <div className="hidden sm:flex items-center gap-2 ml-2">
          {['ES', 'EN'].map((lng) => (
            <button
              key={lng}
              onClick={() => setLang(lng as 'ES' | 'EN')}
              className={`flex items-center justify-center w-9 h-9 rounded-full border text-xs font-bold transition-colors
                ${lang === lng ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800'}`}
              style={{ outline: lang === lng ? '2px solid #2563eb' : undefined }}
              aria-pressed={lang === lng}
            >
              {lng}
            </button>
          ))}
        </div>

        <button 
          onClick={onToggleBasket}
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
  );
};