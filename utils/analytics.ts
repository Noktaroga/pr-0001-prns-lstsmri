// Google Analytics 4 configuration
declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}

// Tu ID de medición de Google Analytics (reemplaza con el tuyo)
const GA_MEASUREMENT_ID = 'G-1RZKGPS679'; // Tu ID real de Google Analytics

// Inicializar Google Analytics
export const initGA = () => {
  // Crear el script de Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Inicializar gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Rastrear evento personalizado
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Rastrear visualización de página
export const trackPageView = (page_title: string, page_location: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title,
      page_location,
    });
  }
};

// Rastrear reproducción de video
export const trackVideoPlay = (videoId: string, videoTitle: string) => {
  trackEvent('play', 'video', `${videoId}-${videoTitle}`);
};

// Rastrear click en anuncio
export const trackAdClick = (adPosition: string) => {
  trackEvent('click', 'advertisement', adPosition);
};

// Rastrear categoría seleccionada
export const trackCategorySelect = (category: string) => {
  trackEvent('select', 'category', category);
};

// Rastrear búsqueda
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', 'site_search', searchTerm);
};