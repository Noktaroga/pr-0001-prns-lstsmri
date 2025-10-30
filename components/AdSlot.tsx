
import React from 'react';

interface AdSlotProps {
  title: string;
  description?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ title, description }) => {
  return (
    <div
      className="grid min-h-[160px] place-items-center rounded-xl border-2 border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
      role="note"
      aria-label="Ad slot"
    >
      <div>
        <div className="mb-1 font-semibold">{title}</div>
        <div className="text-xs opacity-80">{description ?? "Insert here your ad code"}</div>
      </div>
    </div>
  );
};
