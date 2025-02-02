'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/app/components/Navigation';

const features = [
  {
    title: 'Local Processing',
    description: 'Process sensitive data locally without external API calls',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'HIPAA Compliant',
    description: 'Built-in privacy preservation mechanisms for healthcare data',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Smart Detection',
    description: 'Automatically detect and protect sensitive information',
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const hasSession = document.cookie.includes('sb-token=');
    setIsLoggedIn(hasSession);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-6xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Privacy-First AI Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Process sensitive data locally with our WebGPU-powered chat interface. Enterprise-grade security with uncompromising performance.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`}
                className="rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-200"
              >
                Get started
              </a>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-400">Advanced Security</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for secure AI processing
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our platform combines cutting-edge AI with enterprise-grade security features to ensure your data stays protected.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-start bg-gray-900/50 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                  <div className="rounded-lg bg-purple-500/10 p-3 ring-1 ring-purple-500/20">
                    <feature.icon className="h-6 w-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-7 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </main>
  );
}
