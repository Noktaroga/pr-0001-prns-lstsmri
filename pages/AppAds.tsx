import React from 'react';
import JuicyAdsHorizontal from '../components/ads/JuicyAdsHorizontal';

export const BlackAdPlaceholderSquare: React.FC = () => (
  <div className="hidden lg:block" style={{ width: 250, height: 250, marginLeft: 32 }}>
    <JuicyAdsHorizontal adzoneId={1104274} width={250} height={250} />
  </div>
);

export const BlackAdPlaceholderLarge: React.FC = () => (
  <div className="w-full max-w-full overflow-hidden">
    <div className="hidden lg:block" style={{ width: 908, height: 258 }}>
      <JuicyAdsHorizontal adzoneId={1104273} width={908} height={258} />
    </div>
    <div className="block lg:hidden w-full" style={{ height: 250 }}>
      <JuicyAdsHorizontal adzoneId={1104275} width={320} height={250} />
    </div>
  </div>
);

// Ad popup logic
export function loadPopupAd() {
  const script = document.createElement('script');
  script.src = "//understatednurse.com/cODh9U6.bP2j5YlKShWAQi9kNYjnYJ5uN_DyYkznMDyu0t2eNljCkt0eNbj/MD0Q";
  script.async = true;
  script.referrerPolicy = 'no-referrer-when-downgrade';
  document.head.appendChild(script);
  console.log('[App] Popup advertisement triggered on video click');
}
