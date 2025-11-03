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

    // Limpiar el contenido anterior
    adRef.current.innerHTML = '';

    // Crear el elemento ins
    const ins = document.createElement('ins');
    ins.setAttribute('id', adzoneId.toString());
    ins.setAttribute('data-width', width.toString());
    ins.setAttribute('data-height', height.toString());
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
      style={{ width, height }}
      className="flex items-center justify-center bg-white rounded"
    />
  );
};

export default JuicyAdsOverlay;