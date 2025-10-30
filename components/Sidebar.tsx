import React from 'react';
import { categories } from '../constants';

type DurationFilter = 'all' | 'tiny' | 'short' | 'long';

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  activeDurationFilter: DurationFilter;
  onDurationFilterChange: (filter: DurationFilter) => void;
}

const durationFilters: { label: string; value: DurationFilter }[] = [
    { label: "All", value: "all" },
    { label: "Tiny (< 3 min)", value: "tiny" },
    { label: "Short (3-10 min)", value: "short" },
    { label: "Long (> 10 min)", value: "long" },
];


export const Sidebar: React.FC<SidebarProps> = ({ onCategorySelect, activeDurationFilter, onDurationFilterChange }) => {
  const filterButtonClasses = "w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors";
  const activeFilterClasses = "bg-neutral-200 dark:bg-neutral-800 font-semibold";
  const inactiveFilterClasses = "hover:bg-neutral-100 dark:hover:bg-neutral-800/50";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
        <ul className="space-y-1 text-sm" aria-label="Category list">
          {categories.slice(1).map((c) => ( // Exclude 'All'
            <li key={c.value}>
              <button
                onClick={() => onCategorySelect(c.value)}
                className="inline-flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <span>{c.label}</span>
                <span className="text-xs opacity-60">→</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-2 text-sm font-semibold">Duration</h3>
        <div className="space-y-2">
            {durationFilters.map(filter => (
                <button 
                    key={filter.value}
                    onClick={() => onDurationFilterChange(filter.value)}
                    className={`${filterButtonClasses} ${activeDurationFilter === filter.value ? activeFilterClasses : inactiveFilterClasses}`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};