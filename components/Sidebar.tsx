import React from 'react';
import { Category } from '../types';

type DurationFilter = 'all' | 'tiny' | 'short' | 'long';

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  activeDurationFilter: DurationFilter;
  onDurationFilterChange: (filter: DurationFilter) => void;
  categories: Category[];
  filteredVideos?: { category: string }[];
}

const durationFilters: { label: string; value: DurationFilter }[] = [
  { label: "All", value: "all" },
  { label: "Tiny (< 3 min)", value: "tiny" },
  { label: "Short (3-10 min)", value: "short" },
  { label: "Long (> 10 min)", value: "long" },
];


export const Sidebar: React.FC<SidebarProps> = ({
  onCategorySelect,
  activeDurationFilter,
  onDurationFilterChange,
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
    <div className="flex flex-col gap-4">
      {/* --- Categories Section --- */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
        <ul className="space-y-1 text-sm" aria-label="Category list">
          {categoriesWithVideos.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => onCategorySelect(c.value)}
                className="inline-flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-800 text-left"
              >
                <span>{c.label}</span>
                <span className="text-xs opacity-60">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Duration Section --- */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="mb-2 text-sm font-semibold">Duration</h3>
        <div className="space-y-2">
          {durationFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onDurationFilterChange(filter.value)}
              className={`${filterButtonClasses} ${
                activeDurationFilter === filter.value
                  ? activeFilterClasses
                  : inactiveFilterClasses
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- JuicyAds 300x250 Ad --- */}
      <div className="flex justify-center mt-4">
        {/* JuicyAds v3.0 */}
        <div style={{ width: 300, height: 250 }}>
          <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
          <ins id="1104271" data-width="300" data-height="250"></ins>
          <script type="text/javascript" data-cfasync="false" async>{`(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1104271});`}</script>
        </div>
        {/* JuicyAds END */}
      </div>
    </div>
  );
};
