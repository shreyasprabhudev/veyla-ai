'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex lg:hidden">
        <button
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="hidden lg:flex lg:gap-x-12">
        <a href="#features" className="text-sm font-semibold leading-6 text-white hover:text-purple-400">
          Features
        </a>
        <a href="#testimonials" className="text-sm font-semibold leading-6 text-white hover:text-purple-400">
          Testimonials
        </a>
        <a href="#pricing" className="text-sm font-semibold leading-6 text-white hover:text-purple-400">
          Pricing
        </a>
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end">
        <Button
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-700"
        >
          Get Started
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">OpaqueAI</span>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  OpaqueAI
                </div>
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <a
                    href="#features"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#testimonials"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
                  </a>
                  <a
                    href="#pricing"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </div>
                <div className="py-6">
                  <Button
                    href="/dashboard"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
