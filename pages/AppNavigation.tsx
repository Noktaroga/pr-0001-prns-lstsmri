import { useEffect } from 'react';

export function useAppNavigation(state: any, setters: any = {}) {
  // Sync currentPage and activeView with URL
  useEffect(() => {
    if (state.activeView === 'videos') {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(state.currentPage));
      window.history.replaceState({}, '', `/videos?${params.toString()}`);
    } else if (state.activeView === 'home') {
        const path = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        if ((path === '/' || path === '/home') && !params.has('video')) {
            window.history.replaceState({}, '', '/');
        }
    }
  }, [state.currentPage, state.activeView]);

  // Update state from URL on popstate
  useEffect(() => {
    const getPageFromUrl = () => {
      const search = window.location.search;
      const path = window.location.pathname;
      const params = new URLSearchParams(search);
      const page = parseInt(params.get('page') || '1', 10);
      return path.startsWith('/videos') && (!page || page < 1) ? 1 : (isNaN(page) || page < 1 ? 1 : page);
    };
    const onPopState = () => {
      if (setters.setCurrentPage) setters.setCurrentPage(getPageFromUrl());
      if (setters.setActiveView) {
        const path = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const hasVideoParam = params.has('video');
        if (path.startsWith('/videos')) {
          setters.setActiveView('videos');
        } else if ((path === '/home' || path === '/Home' || path === '/') && !hasVideoParam) {
          setters.setActiveView('home');
        }
      }
      // Handle video selection via URL param
      if (setters.setSelectedVideo && setters.videos) {
        const params = new URLSearchParams(window.location.search);
        const videoId = params.get('video');
        if (videoId && setters.videos.length > 0) {
          const found = setters.videos.find((v: any) => v.id === videoId);
          if (found) {
            setters.setSelectedVideo(found);
            document.title = `${found.title} - PORNSTERS`;
          } else {
            setters.setSelectedVideo(null);
            document.title = 'PORNSTERS';
          }
        } else if (!videoId) {
          setters.setSelectedVideo(null);
          document.title = 'PORNSTERS';
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setters]);

  // Return navigation helpers if needed
  return {};
}
