'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold text-red-500">Something went wrong!</h1>
      <p className="mt-4 text-gray-600">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="mt-6 flex gap-4">
        <Button
          onClick={reset}
          variant="default"
        >
          Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
