import React from 'react';
import { Category } from '../../types';


interface SidebarProps {
  onCategorySelect: (category: string) => void;
  categories: Category[];
  filteredVideos?: { category: string }[];
}


export const Sidebar: React.FC<SidebarProps> = ({
  onCategorySelect,
  categories,
  filteredVideos = [],
}) => {
  const filterButtonClasses =
    "w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors";
  const activeFilterClasses = "bg-neutral-800 font-semibold";
  const inactiveFilterClasses = "hover:bg-neutral-800/50";

  // Mostrar siempre todas las categorías (menos 'all')
  const categoriesWithVideos = categories.filter((c) => c.value !== 'all');

  return (
    <div className="flex flex-col gap-4 w-full max-w-full">
      {/* --- Categories Section --- */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 w-full">
        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
        <ul
          className="space-y-1 text-sm max-h-[40vh] overflow-y-auto pr-1"
          aria-label="Category list"
        >
          {categoriesWithVideos.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => onCategorySelect(c.value)}
                className="inline-flex w-full items-center justify-between rounded-md px-2 py-2 text-base hover:bg-neutral-800 text-left"
              >
                <span className="truncate">{c.label}</span>
                <span className="text-xs opacity-60 flex-shrink-0 ml-2">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>



      {/* --- JuicyAds Responsive Ad --- */}
      <div className="flex justify-center mt-4 w-full overflow-hidden">
        {/* JuicyAds v3.0 - Responsive */}
        <div 
          className="w-full max-w-[300px]" 
          style={{ 
            maxWidth: '100%',
            aspectRatio: '300/250',
            minHeight: '200px'
          }}
        >
          <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
          <ins id="1104271" data-width="300" data-height="250" style={{ maxWidth: '100%', height: 'auto' }}></ins>
          <script type="text/javascript" data-cfasync="false" async>{`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1104271});`}</script>
        </div>
        {/* JuicyAds END */}
      </div>
    </div>
  );
};
