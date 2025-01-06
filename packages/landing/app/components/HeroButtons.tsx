'use client';

import { Button } from '@/components/ui/button';

export function HeroButtons() {
  return (
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <Button
        href="/dashboard"
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
      >
        Get Started
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </Button>
      <Button
        href="#features"
        variant="outline"
        className="text-purple-400 border-purple-400 hover:bg-purple-950"
      >
        Learn more
      </Button>
    </div>
  );
}
