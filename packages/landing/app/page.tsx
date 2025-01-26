'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/app/components/Navbar';
import { HeroButtons } from '@/app/components/HeroButtons';

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
    // Simple cookie check for "Welcome back" message
    const hasSession = document.cookie.includes('sb-token=');
    setIsLoggedIn(hasSession);
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex justify-end p-4">
        {isLoggedIn ? (
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Welcome back!</span>
            <a
              href="https://app.veylaai.com/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <a
            href="https://app.veylaai.com/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login or Sign Up
          </a>
        )}
      </div>

      <div className="flex-1 px-4">
        <h1 className="text-4xl font-bold text-center mt-20 mb-8">
          Privacy-First AI Platform
        </h1>
        <p className="text-center text-xl mb-12">
          Process sensitive data locally with our WebGPU-powered chat interface
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
