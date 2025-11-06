import { useState, useEffect, useMemo } from 'react';
import { Video, Category } from '../types';
import { CATEGORY_LIST, fetchVideosAndCategories } from '../constants';
import { initGA } from '../utils/analytics';
import DICTIONARY_ENG from '../dictionaries/dictionary-eng';
import {
  getMinutes,
  calculateSearchRelevance,
  normalizeText,
} from './AppHelpers';
import { smartVideoSearch } from '../utils/smartVideoSearch';

export function useAppState() {
  // Translation function using DICTIONARY_ENG
  const t = (key: string): string => DICTIONARY_ENG[key] || key;

  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'exact' | 'intelligent' | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(CATEGORY_LIST[0]);
  const [durationFilter, setDurationFilter] = useState<'all' | 'tiny' | 'short' | 'long'>('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loadingVideoFromUrl, setLoadingVideoFromUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('video');
    }
    return false;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(36);
  const [totalVideos, setTotalVideos] = useState(0);
  const [videosPage, setVideosPage] = useState<Video[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'videos'>('home');

  // Google Analytics initialization
  useEffect(() => {
    initGA();
  }, []);

  // Detect initial route and set activeView accordingly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/videos')) {
        setActiveView('videos');
      } else {
        setActiveView('home');
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetchVideosAndCategories()
      .then(({ videos, categories }) => {
        setVideos(videos);
        setCategories(categories);
      })
      .catch(() => {
        setLoadError('No se pudieron cargar los videos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

    // Paginated fetch for videos grid (backend pagination)
    useEffect(() => {
      if (activeView !== 'videos') return;
      console.log('[AppState] Fetch paginado:', { currentPage, pageSize, activeCat });
      setLoading(true);
      setLoadError(null);
      let url = `/api/videos?page=${currentPage}&size=${pageSize}`;
      if (activeCat && activeCat !== 'all') {
        url += `&category=${encodeURIComponent(activeCat)}`;
      }
      fetch(url)
        .then(async (res) => {
          if (!res.ok) throw new Error('No se pudo obtener /api/videos');
          const data = await res.json();
          let allRawVideos;
          let totalCount = 0;
          if (Array.isArray(data.videos)) {
            allRawVideos = data.videos.filter(Boolean);
            totalCount = typeof data.total === 'number' ? data.total : allRawVideos.length;
          } else if (data && typeof data === 'object') {
            allRawVideos = Object.values(data).flat().filter(Boolean);
            totalCount = typeof data.total === 'number' ? data.total : allRawVideos.length;
          } else {
            allRawVideos = [];
            totalCount = 0;
          }
          console.log('[AppState] Respuesta paginada:', { allRawVideosLength: allRawVideos.length, totalCount });
          setVideosPage(allRawVideos);
          setTotalVideos(totalCount);
        })
        .catch(() => {
          setLoadError('No se pudieron cargar los videos.');
        })
        .finally(() => {
          setLoading(false);
        });
    }, [activeView, currentPage, pageSize, activeCat]);
 
    useEffect(() => {
      // Detectar videoId en ?video=ID o en /video/ID
      if (typeof window !== 'undefined') {
        let videoId = null;
        const params = new URLSearchParams(window.location.search);
        if (params.get('video')) {
          videoId = params.get('video');
        } else {
          // Detectar /video/ID en el pathname
          const match = window.location.pathname.match(/\/video\/(\w+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        if (videoId) {
          console.log('[AppState] Buscando videoId:', videoId);
          let found = videosPage.find(v => String(v.id) === videoId);
          if (!found) {
            found = videos.find(v => String(v.id) === videoId);
          }
          if (!found) {
            console.log('[AppState] Video no encontrado localmente, haciendo fetch directo:', videoId);
            fetch(`/api/videos?videoId=${videoId}`)
              .then(async res => {
                if (!res.ok) throw new Error('No se pudo obtener el video por ID');
                const data = await res.json();
                console.log('[AppState] Respuesta fetch videoId:', data);
                if (Array.isArray(data.videos) && data.videos.length > 0) {
                  setSelectedVideo(data.videos[0]);
                    setLoadingVideoFromUrl(false);
                } else {
                  setSelectedVideo(undefined);
                    setLoadingVideoFromUrl(false);
                  console.warn('[AppState] No se encontró el video en la respuesta del backend');
                }
              })
              .catch((err) => {
                setSelectedVideo(undefined);
                  setLoadingVideoFromUrl(false);
                console.error('[AppState] Error al obtener el video por ID:', err);
              });
          } else {
            console.log('[AppState] Video encontrado localmente:', found);
            setSelectedVideo(found);
              setLoadingVideoFromUrl(false);
          }
        }
      }
    }, [videosPage, videos, typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('video') || (window.location.pathname.match(/\/video\/(\w+)/)?.[1] ?? undefined)) : undefined]);

  // Filter, search, and sort videos
  const filteredVideos = useMemo(() => {
    let result = videos;
    // Category filter
    if (activeCat && activeCat !== 'all') {
      result = result.filter(v => v.category === activeCat);
    }
    // Duration filter
    if (durationFilter !== 'all') {
      result = result.filter(v => {
        const mins = getMinutes(v.duration);
        if (durationFilter === 'tiny') return mins < 2.5;
        if (durationFilter === 'short') return mins >= 2.5 && mins < 7;
        if (durationFilter === 'long') return mins >= 7;
        return true;
      });
    }
    // Smart search filter
    if (activeSearchQuery.trim()) {
      result = smartVideoSearch(result, activeSearchQuery);
    }
    return result;
  }, [videos, activeSearchQuery, activeCat, durationFilter]);

  // Restore backend pagination logic: use videosPage when no search, filteredVideos only for search
  const shouldUseLocalFiltering = activeView === 'videos' && activeSearchQuery.trim();
  const displayVideos = shouldUseLocalFiltering ? filteredVideos : videosPage;
  const totalPages = shouldUseLocalFiltering
    ? Math.ceil(filteredVideos.length / pageSize)
    : (activeView === 'videos' ? Math.ceil(totalVideos / pageSize) : 1);

  const paginatedFilteredVideos = useMemo(() => {
    if (!shouldUseLocalFiltering) return displayVideos;
    const start = (currentPage - 1) * pageSize;
    return filteredVideos.slice(start, start + pageSize);
  }, [filteredVideos, displayVideos, currentPage, pageSize, shouldUseLocalFiltering]);

  const finalDisplayVideos = shouldUseLocalFiltering ? paginatedFilteredVideos : displayVideos;

  // Handlers
  const handleSearch = (searchTerm: string) => {
    setActiveSearchQuery(searchTerm);
    if (searchTerm.trim()) {
      setActiveView('videos');
    } else {
      setSearchType(null);
    }
  };

  const handleCategorySelect = (category: string) => {
    setActiveView('videos');
    setActiveCat(category);
    setSelectedVideo(null);
    setActiveSearchQuery('');
    setQuery('');
    setSearchType(null);
  };

  const handleViewChange = (view: 'home' | 'videos') => {
    setActiveView(view);
    setSelectedVideo(null);
    setActiveSearchQuery('');
    setQuery('');
    setSearchType(null);
  };

  return {
    t,
    videos,
    setVideos,
    categories,
    setCategories,
    query,
    setQuery,
    activeSearchQuery,
    setActiveSearchQuery,
    searchType,
    setSearchType,
    loading,
    setLoading,
    loadError,
    setLoadError,
    activeCat,
    setActiveCat,
    durationFilter,
    setDurationFilter,
    showSidebar,
    setShowSidebar,
    selectedVideo,
    setSelectedVideo,
    loadingVideoFromUrl,
    setLoadingVideoFromUrl,
    currentPage,
    setCurrentPage,
    pageSize,
    totalVideos,
    setTotalVideos,
    videosPage,
    setVideosPage,
    activeView,
    setActiveView,
    filteredVideos,
    finalDisplayVideos,
    totalPages,
    handleSearch,
    handleCategorySelect,
    handleViewChange,
  };
}
