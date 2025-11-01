
import React, { useState, useMemo } from 'react';
import { Video } from '../types';
import { BasketItem } from './BasketItem';
import { BasketMultiplayer } from './BasketMultiplayer';

interface BasketProps {
    isOpen: boolean;
    onClose: () => void;
    basketItems: string[];
    allVideos: Video[];
    onToggleBasketItem: (videoId: string) => void;
    onVideoSelect: (video: Video) => void;
    onClearBasket: () => void;
}

const PAGE_SIZE = 5;

export const Basket: React.FC<BasketProps> = ({ isOpen, onClose, basketItems, allVideos, onToggleBasketItem, onVideoSelect, onClearBasket }) => {
    const [isAutoplayEnabled, setAutoplayEnabled] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showMultiplayer, setShowMultiplayer] = useState(false);
    const [highlightMultiplayer, setHighlightMultiplayer] = useState(false);
    const [showMultiplayerInfo, setShowMultiplayerInfo] = useState(false);

    // Show info popup when event is triggered
    React.useEffect(() => {
        const handler = () => {
            setHighlightMultiplayer(true);
            setShowMultiplayerInfo(true);
            setTimeout(() => setHighlightMultiplayer(false), 1000);
        };
        window.addEventListener('highlight-basket-multiplayer', handler);
        return () => window.removeEventListener('highlight-basket-multiplayer', handler);
    }, []);

    // ESC closes info popup
    React.useEffect(() => {
        if (!showMultiplayerInfo) return;
        const esc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowMultiplayerInfo(false);
        };
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [showMultiplayerInfo]);

    React.useEffect(() => {
        const handler = () => {
            setHighlightMultiplayer(true);
            setTimeout(() => setHighlightMultiplayer(false), 1000);
        };
        window.addEventListener('highlight-basket-multiplayer', handler);
        return () => window.removeEventListener('highlight-basket-multiplayer', handler);
    }, []);

    const basketVideos = useMemo(() => {
        return basketItems.map(id => allVideos.find(video => video.id === id)).filter(Boolean) as Video[];
    }, [basketItems, allVideos]);

    const totalPages = Math.ceil(basketVideos.length / PAGE_SIZE);
    const paginatedVideos = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return basketVideos.slice(startIndex, startIndex + PAGE_SIZE);
    }, [basketVideos, currentPage]);

        if (!isOpen) return null;
            if (showMultiplayer) {
                // Pasar los primeros 4 videos seleccionados
                const selectedVideos = basketItems
                    .map(id => allVideos.find(v => v.id === id))
                    .filter(Boolean)
                    .slice(0, 4) as Video[];
                return <BasketMultiplayer onClose={() => setShowMultiplayer(false)} videos={selectedVideos} />;
            }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="basket-title"
        >
            <div 
                className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                    <h2 id="basket-title" className="text-lg font-semibold">My Basket ({basketItems.length})</h2>
                    <div className="flex items-center gap-4">
                        {/* Autoplay eliminado */}
                                                {basketItems.length > 0 && (
                                                    <button
                                                        onClick={onClearBasket}
                                                        className="px-3 py-1 text-xs rounded-md border border-red-400 text-red-600 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900"
                                                        aria-label="Clear basket"
                                                    >
                                                        Vaciar cesta
                                                    </button>
                                                )}
                                                                        <div className="relative inline-block">
                                                                            <button
                                                                                onClick={() => setShowMultiplayer(true)}
                                                                                className={
                                                                                    `px-3 py-1 text-xs rounded-md border border-blue-400 text-blue-700 dark:border-blue-600 ` +
                                                                                    (basketItems.length === 4
                                                                                        ? 'hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer'
                                                                                        : 'opacity-50 cursor-not-allowed') +
                                                                                    (highlightMultiplayer ? ' ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 animate-pulse' : '')
                                                                                }
                                                                                aria-label="Abrir modo multiplayer"
                                                                                disabled={basketItems.length !== 4}
                                                                            >
                                                                                Multiplayer ({basketItems.length}/4)
                                                                            </button>
                                                                            {showMultiplayerInfo && (
                                                                                <div className="absolute left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-purple-500 bg-white dark:bg-neutral-900 shadow-2xl p-6 animate-fade-in flex flex-col items-center">
                                                                                    <button
                                                                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 text-xl font-bold"
                                                                                        onClick={() => setShowMultiplayerInfo(false)}
                                                                                        aria-label="Cerrar info"
                                                                                    >
                                                                                        ×
                                                                                    </button>
                                                                                    <div className="text-center w-full flex flex-col items-center justify-center">
                                                                                        <div className="text-purple-600 dark:text-purple-400 text-base font-extrabold mb-2 drop-shadow-[0_0_8px_#a21caf,0_0_16px_#a21caf] animate-pulse" style={{textShadow:'0 0 8px #a21caf, 0 0 16px #a21caf, 0 0 32px #a21caf'}}>
                                                                                            ¿Qué es el modo Multiplayer?
                                                                                        </div>
                                                                                        <div className="text-xs text-neutral-700 dark:text-neutral-200 text-center mb-2 max-w-xs" style={{lineHeight:'1.5'}}>
                                                                                            Mira hasta <b className='text-purple-500 dark:text-purple-300'>4 videos</b> de tu cesta al mismo tiempo, en una pantalla dividida en 4 cuadrantes.<br/>
                                                                                            Solo puedes usarlo si tienes exactamente 4 videos en la cesta.<br/>
                                                                                            Pulsa el botón <b className='text-purple-500 dark:text-purple-300'>Multiplayer</b> para empezar la reproducción simultánea.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            aria-label="Close basket"
                        >
                            ✕
                        </button>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto p-4">
                    {paginatedVideos.length > 0 ? (
                        <div className="space-y-4">
                            {paginatedVideos.map((video, idx) => (
                                <BasketItem 
                                    key={video.id + '-' + (video.page_url || idx)}
                                    video={video}
                                    isAutoplayEnabled={isAutoplayEnabled}
                                    onRemove={onToggleBasketItem}
                                    onSelect={onVideoSelect}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <p className="font-semibold text-neutral-800 dark:text-neutral-200">Your basket is empty</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Add videos to watch them here.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <footer className="flex items-center justify-center p-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                        <div className="flex items-center gap-2">
                             <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50">Prev</button>
                             <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Page {currentPage} of {totalPages}</span>
                             <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 disabled:opacity-50">Next</button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};
