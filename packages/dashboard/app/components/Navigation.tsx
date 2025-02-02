'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ModelsDropdown } from '@/app/features/chat/components/ModelsDropdown';

export function Navigation() {
  return (
    <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link 
            href={process.env.NEXT_PUBLIC_APP_URL || '/'}
            className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 hover:opacity-80 transition-opacity"
          >
            Veyla AI
          </Link>
          <ModelsDropdown />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={process.env.NEXT_PUBLIC_APP_URL || '/'}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
