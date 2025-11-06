import React, { useRef, useEffect } from 'react';

const VideoAdManager: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current) {
      const script = document.createElement('script');
      script.src = 'https://js.wpadmngr.com/static/adManager.js';
      script.async = true;
      script.setAttribute('data-admpid', '388725');
      adRef.current.appendChild(script);
    }
    return () => {
      if (adRef.current) {
        const scripts = adRef.current.querySelectorAll('script[src*="wpadmngr"]');
        scripts.forEach(s => s.remove());
      }
    };
  }, []);

  return <div ref={adRef} style={{ width: '100%' }} />;
};

export default VideoAdManager;
