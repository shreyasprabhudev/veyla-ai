'use client';

import { Navigation } from './Navigation';

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">OpaqueAI</span>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              OpaqueAI
            </div>
          </a>
        </div>
        <Navigation />
      </nav>
    </header>
  );
}
