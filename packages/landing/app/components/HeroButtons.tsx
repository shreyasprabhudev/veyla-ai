'use client';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export function HeroButtons() {
  return (
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <Button
        href="/dashboard"
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
      >
        Get Started
        <ArrowRightIcon className="h-5 w-5 inline-block" aria-hidden="true" />
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
