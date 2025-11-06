import React from 'react';
import { useAppState } from './AppState';
import { useBasket } from './AppBasket';
import { useAppNavigation } from './AppNavigation';
import * as AppHelpers from './AppHelpers';
import * as AppAds from './AppAds';
import { AppMainRender } from './AppRender';

const AppOrchestrator: React.FC = () => {
  // 1. State and hooks
  const state = useAppState();

  // 2. Basket logic
  const basket = useBasket(state.videos);

  // 3. Navigation logic
  useAppNavigation(state);

  // 4. Helpers and ads
  const helpers = AppHelpers;
  const ads = AppAds;

  // Handler for video selection (ads, state, scroll, URL)
  const onVideoSelect = (video) => {
    // Optional: trigger ad popup logic if needed
    if (ads && typeof ads.loadPopupAd === 'function') {
      ads.loadPopupAd();
    }
    state.setSelectedVideo(video);
    if (basket.setIsBasketOpen) basket.setIsBasketOpen(false);
    window.scrollTo(0, 0);
    // Push video ID to URL
    window.history.pushState({ videoId: video.id }, '', `?video=${video.id}`);
  };

  // 5. Main render
  return (
    <AppMainRender
      {...state}
      {...basket}
      helpers={helpers}
      ads={ads}
  onVideoSelect={onVideoSelect}
  onViewChange={state.handleViewChange}
    />
  );
};

export default AppOrchestrator;
