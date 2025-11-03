
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="basket-title"
        >
            <div 
                className="w-full max-w-2xl bg-neutral-950 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] border border-neutral-800"
                style={{
                    boxShadow: '0 0 20px rgba(255, 45, 85, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-neutral-700 flex-shrink-0"
                    style={{
                        borderBottom: '1px solid #374151',
                        boxShadow: '0 1px 0 0 rgba(255, 45, 85, 0.2)',
                    }}
                >
                    <h2 id="basket-title" className="text-lg font-semibold text-white">My Basket ({basketItems.length})</h2>
                    <div className="flex items-center gap-4">
                        {/* Autoplay eliminado */}
                                                {basketItems.length > 0 && (
                                                    <button
                                                        onClick={onClearBasket}
                                                        className="px-3 py-1 text-xs rounded-md border border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
                                                        style={{
                                                            boxShadow: '0 0 5px rgba(239, 68, 68, 0.3)',
                                                        }}
                                                        aria-label="Clear basket"
                                                    >
                                                        Vaciar cesta
                                                    </button>
                                                )}
                                                                        <div className="relative inline-block">
                                                                            <button
                                                                                onClick={() => setShowMultiplayer(true)}
                                                                                className={
                                                                                    `px-3 py-1 text-xs rounded-md border transition-all duration-300 ` +
                                                                                    (basketItems.length === 4
                                                                                        ? 'border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 cursor-pointer'
                                                                                        : 'border-neutral-600 text-neutral-500 opacity-50 cursor-not-allowed') +
                                                                                    (highlightMultiplayer ? ' ring-4 ring-yellow-400 ring-offset-2 ring-offset-neutral-950 animate-pulse' : '')
                                                                                }
                                                                                style={{
                                                                                    boxShadow: basketItems.length === 4 ? '0 0 5px rgba(168, 85, 247, 0.3)' : 'none',
                                                                                }}
                                                                                aria-label="Abrir modo multiplayer"
                                                                                disabled={basketItems.length !== 4}
                                                                            >
                                                                                Multiplayer ({basketItems.length}/4)
                                                                            </button>
                                                                            {showMultiplayerInfo && (
                                                                                <div className="absolute left-1/2 z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-purple-500 bg-neutral-950 shadow-2xl p-6 animate-fade-in flex flex-col items-center"
                                                                                    style={{
                                                                                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                                                                                    }}
                                                                                >
                                                                                    <button
                                                                                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-purple-500/20 text-purple-400 text-xl font-bold transition-colors duration-300"
                                                                                        onClick={() => setShowMultiplayerInfo(false)}
                                                                                        aria-label="Cerrar info"
                                                                                    >
                                                                                        ×
                                                                                    </button>
                                                                                    <div className="text-center w-full flex flex-col items-center justify-center">
                                                                                        <div className="text-purple-400 text-base font-extrabold mb-2 animate-pulse" 
                                                                                            style={{
                                                                                                textShadow: '0 0 8px #a855f7, 0 0 16px #a855f7, 0 0 32px #a855f7',
                                                                                                filter: 'drop-shadow(0 0 8px #a855f7)',
                                                                                            }}
                                                                                        >
                                                                                            ¿Qué es el modo Multiplayer?
                                                                                        </div>
                                                                                        <div className="text-xs text-neutral-300 text-center mb-2 max-w-xs" style={{lineHeight:'1.5'}}>
                                                                                            Mira hasta <b className='text-purple-400'>4 videos</b> de tu cesta al mismo tiempo, en una pantalla dividida en 4 cuadrantes.<br/>
                                                                                            Solo puedes usarlo si tienes exactamente 4 videos en la cesta.<br/>
                                                                                            Pulsa el botón <b className='text-purple-400'>Multiplayer</b> para empezar la reproducción simultánea.
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300"
                            style={{
                                filter: 'drop-shadow(0 0 3px #ef4444)',
                            }}
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
                            <p className="font-semibold text-neutral-200">Your basket is empty</p>
                            <p className="text-sm text-neutral-400">Add videos to watch them here.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <footer className="flex items-center justify-center p-4 border-t border-neutral-700 flex-shrink-0"
                        style={{
                            borderTop: '1px solid #374151',
                            boxShadow: '0 -1px 0 0 rgba(255, 45, 85, 0.2)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setCurrentPage(p => p - 1)} 
                                disabled={currentPage === 1} 
                                className="px-3 py-1 text-sm rounded-md border border-neutral-600 text-neutral-300 hover:border-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                style={{
                                    boxShadow: currentPage === 1 ? 'none' : '0 0 3px rgba(168, 85, 247, 0.2)',
                                }}
                            >
                                Prev
                            </button>
                             <span className="text-sm font-medium text-neutral-400">Page {currentPage} of {totalPages}</span>
                             <button 
                                onClick={() => setCurrentPage(p => p + 1)} 
                                disabled={currentPage === totalPages} 
                                className="px-3 py-1 text-sm rounded-md border border-neutral-600 text-neutral-300 hover:border-purple-500 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                style={{
                                    boxShadow: currentPage === totalPages ? 'none' : '0 0 3px rgba(168, 85, 247, 0.2)',
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};
