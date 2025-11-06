import { useState, useEffect } from 'react';
import { Video } from '../types';

export function useBasket(videos: Video[] = []) {
  const [basketItems, setBasketItems] = useState<string[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [basketFullPopup, setBasketFullPopup] = useState(false);

  // cargar basket desde localStorage al montar
  useEffect(() => {
    try {
      const storedBasket = localStorage.getItem('videoBasket');
      if (storedBasket) {
        const parsed: string[] = JSON.parse(storedBasket);
        setBasketItems(parsed);
      }
    } catch (error) {
      console.error("Failed to parse basket from localStorage", error);
    }
  }, []);

  // Limpiar basket de IDs huérfanas cuando cambian los videos
  useEffect(() => {
    setBasketItems(prev => prev.filter(id => videos.some(v => String(v.id) === String(id))));
  }, [videos]);

  // persistir basket cuando cambie
  useEffect(() => {
    localStorage.setItem('videoBasket', JSON.stringify(basketItems));
  }, [basketItems]);

  const toggleBasketItem = (videoId: string) => {
    setBasketItems(prev => {
      console.log('[useBasket] toggleBasketItem called with:', videoId, 'Current basket:', prev);
      if (prev.includes(videoId)) {
        const updated = prev.filter(id => id !== videoId);
        console.log('[useBasket] Removed video:', videoId, 'New basket:', updated);
        return updated;
      } else {
        if (prev.length >= 4) {
          setBasketFullPopup(true);
          console.log('[useBasket] Basket full, cannot add:', videoId);
          return prev;
        }
        const updated = [...prev, videoId];
        console.log('[useBasket] Added video:', videoId, 'New basket:', updated);
        return updated;
      }
    });
  };

  const toggleBasketModal = () => setIsBasketOpen(prev => !prev);

  return {
    basketItems,
    setBasketItems,
    isBasketOpen,
    setIsBasketOpen,
    basketFullPopup,
    setBasketFullPopup,
    toggleBasketItem,
    toggleBasketModal,
  };
}
