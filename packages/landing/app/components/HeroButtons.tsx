'use client';

import { Button } from '@/components/ui/button';
import { routes } from '@veyla/shared/routes';

export default function HeroButtons() {
  return (
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <a
        href={`${routes.app}${routes.signIn}`}
        className="rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-200"
      >
        Get Started
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2 inline-block">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
      <a
        href="#features"
        className="text-sm font-semibold leading-6 text-gray-900"
      >
        Learn more <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
