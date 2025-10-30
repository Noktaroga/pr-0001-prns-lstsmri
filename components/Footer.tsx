
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white/80 py-8 text-sm dark:border-neutral-800 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-2 text-base font-semibold">About</div>
            <p className="max-w-xs opacity-70">
              Base template for a neutral video platform. Replace with your copy and legal pages.
            </p>
          </div>
          <div>
            <div className="mb-2 text-base font-semibold">Links</div>
            <ul className="space-y-1.5 opacity-80">
              <li><a href="#" className="hover:underline">Terms</a></li>
              <li><a href="#" className="hover:underline">Privacy</a></li>
              <li><a href="#" className="hover:underline">DMCA</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-base font-semibold">Community</div>
            <ul className="space-y-1.5 opacity-80">
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Support</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-base font-semibold">Newsletter</div>
            <form className="flex gap-2">
              <label className="sr-only">Email</label>
              <input type="email" placeholder="you@example.com" className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500 dark:focus:border-white" />
              <button className="shrink-0 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white shadow hover:opacity-90 dark:bg-white dark:text-neutral-900">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs opacity-70 dark:border-neutral-800">
          © {new Date().getFullYear()} VideoSite. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
