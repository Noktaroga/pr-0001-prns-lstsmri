
import React, { useState, useMemo } from 'react';
import { Video } from '../types';
import { BasketItem } from './BasketItem';

interface BasketProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: basketItems should be an array of strings to match video.id type.
    basketItems: string[];
    allVideos: Video[];
    // FIX: videoId should be a string to match video.id type.
    onToggleBasketItem: (videoId: string) => void;
    onVideoSelect: (video: Video) => void;
}

const PAGE_SIZE = 5;

export const Basket: React.FC<BasketProps> = ({ isOpen, onClose, basketItems, allVideos, onToggleBasketItem, onVideoSelect }) => {
    const [isAutoplayEnabled, setAutoplayEnabled] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const basketVideos = useMemo(() => {
        return basketItems.map(id => allVideos.find(video => video.id === id)).filter(Boolean) as Video[];
    }, [basketItems, allVideos]);

    const totalPages = Math.ceil(basketVideos.length / PAGE_SIZE);
    const paginatedVideos = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return basketVideos.slice(startIndex, startIndex + PAGE_SIZE);
    }, [basketVideos, currentPage]);

    if (!isOpen) return null;

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
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <span>Autoplay</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={isAutoplayEnabled}
                                    onChange={() => setAutoplayEnabled(p => !p)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${isAutoplayEnabled ? 'bg-neutral-800 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white dark:bg-neutral-800 w-4 h-4 rounded-full transition-transform ${isAutoplayEnabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
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
