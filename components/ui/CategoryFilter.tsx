import React from "react";
import { Category } from "../../types";

interface CategoryFilterProps {
  activeCat: string;
  setActiveCat: (category: string) => void;
  categories: Category[]; // ahora las recibe como prop
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCat,
  setActiveCat,
  categories,
}) => {
  return (
    <div className="sticky top-16 z-30 w-full border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center gap-3 py-2 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Categories"
        >
          {categories.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={activeCat === c.value}
              onClick={() => setActiveCat(c.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-all whitespace-nowrap ${
                activeCat === c.value
                  ? "border-white bg-white text-neutral-900"
                  : "border-neutral-700 hover:bg-neutral-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
