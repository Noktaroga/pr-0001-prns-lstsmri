import React, { useEffect, useRef } from 'react';

interface JuicyAdsOverlayProps {
  adzoneId: number;
  width?: number;
  height?: number;
}

const JuicyAdsOverlay: React.FC<JuicyAdsOverlayProps> = ({ adzoneId, width = 300, height = 250 }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!adRef.current) return;

    // Calcular tamaño responsivo para overlay
    const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, width) : width;
    const responsiveWidth = Math.min(width, maxWidth);
    const aspectRatio = height / width;
    const responsiveHeight = Math.round(responsiveWidth * aspectRatio);

    // Limpiar el contenido anterior
    adRef.current.innerHTML = '';

    // Crear el elemento ins
    const ins = document.createElement('ins');
    ins.setAttribute('id', adzoneId.toString());
    ins.setAttribute('data-width', responsiveWidth.toString());
    ins.setAttribute('data-height', responsiveHeight.toString());
    ins.style.maxWidth = '100%';
    ins.style.width = '100%';
    adRef.current.appendChild(ins);

    // Función para cargar el anuncio
    const loadAd = () => {
      if (typeof window !== 'undefined') {
        // Inicializar adsbyjuicy si no existe
        if (!(window as any).adsbyjuicy) {
          (window as any).adsbyjuicy = [];
        }

        // Cargar el script de JuicyAds si no está cargado
        if (!scriptLoadedRef.current && !document.querySelector('script[src*="jads.co"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          script.src = 'https://poweredby.jads.co/js/jads.js';
          
          script.onload = () => {
            scriptLoadedRef.current = true;
            // Push del anuncio después de que el script se cargue
            setTimeout(() => {
              ((window as any).adsbyjuicy = (window as any).adsbyjuicy || []).push({'adzone': adzoneId});
            }, 100);
          };
          
          document.head.appendChild(script);
        } else {
          // Si el script ya está cargado, push directo
          setTimeout(() => {
            ((window as any).adsbyjuicy = (window as any).adsbyjuicy || []).push({'adzone': adzoneId});
          }, 100);
        }
      }
    };

    // Cargar el anuncio
    loadAd();

    // Cleanup function
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [adzoneId, width, height]);

  return (
    <div 
      ref={adRef} 
      style={{ 
        width: Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width), 
        height: Math.round((Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width)) * (height / width)),
        maxWidth: '100%'
      }}
      className="flex items-center justify-center bg-white rounded overflow-hidden"
    />
  );
};

export default JuicyAdsOverlay;