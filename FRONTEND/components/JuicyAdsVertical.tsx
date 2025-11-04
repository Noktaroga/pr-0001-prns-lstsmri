import React, { useEffect, useRef } from 'react';

interface JuicyAdsVerticalProps {
  adzoneId: number;
  width?: number;
  height?: number;
}

const JuicyAdsVertical: React.FC<JuicyAdsVerticalProps> = ({ adzoneId, width = 160, height = 600 }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    
    // Calcular ancho responsivo para verticales
    const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, width) : width;
    const responsiveWidth = Math.min(width, maxWidth);
    
    // Limpia el contenedor
    adRef.current.innerHTML = '';

    // Crea el <ins> para el anuncio
    const ins = document.createElement('ins');
    ins.setAttribute('id', adzoneId.toString());
    ins.setAttribute('data-width', responsiveWidth.toString());
    ins.setAttribute('data-height', height.toString());
    ins.style.maxWidth = '100%';
    ins.style.width = '100%';
    adRef.current.appendChild(ins);

    // Carga el script de JuicyAds solo una vez
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://poweredby.jads.co/js/jads.js';
    adRef.current.appendChild(script);

    // Ejecuta el push para mostrar el anuncio
    const pushScript = document.createElement('script');
    pushScript.type = 'text/javascript';
    pushScript.async = true;
    pushScript.text = `(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':${adzoneId}});`;
    adRef.current.appendChild(pushScript);
  }, [adzoneId, width, height]);

  return (
    <div className="flex justify-center my-6 w-full overflow-hidden px-4">
      <div 
        ref={adRef} 
        className="w-full max-w-[160px]"
        style={{ 
          width: Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width), 
          height,
          maxWidth: '100%'
        }} 
      />
    </div>
  );
};

export default JuicyAdsVertical;
