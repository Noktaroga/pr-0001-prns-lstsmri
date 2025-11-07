import React, { useEffect } from 'react';

// Clickadilla ad script loader component
const Clickadilla: React.FC = () => {
  useEffect(() => {
    // Load the obfuscated script from a separate JS file
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '/clickadilla-ad.js'; // Place the JS file in public/
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  return null;
};

export default Clickadilla;
