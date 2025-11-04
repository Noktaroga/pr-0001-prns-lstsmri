import React, { useEffect, useRef } from 'react';

interface JuicyAdsHorizontalProps {
  adzoneId: number;
  width?: number;
  height?: number;
}

const JuicyAdsHorizontal: React.FC<JuicyAdsHorizontalProps> = ({ adzoneId, width = 728, height = 90 }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    
    // Calcular ancho responsivo
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : width;
    const responsiveWidth = Math.min(width, maxWidth);
    
    adRef.current.innerHTML = '';
    const ins = document.createElement('ins');
    ins.setAttribute('id', adzoneId.toString());
    ins.setAttribute('data-width', responsiveWidth.toString());
    ins.setAttribute('data-height', height.toString());
    ins.style.maxWidth = '100%';
    ins.style.width = '100%';
    
    adRef.current.appendChild(ins);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://poweredby.jads.co/js/jads.js';
    adRef.current.appendChild(script);
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
        className="w-full max-w-[728px]"
        style={{ 
          width: Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width), 
          height,
          maxWidth: '100%'
        }} 
      />
    </div>
  );
};

export default JuicyAdsHorizontal;
