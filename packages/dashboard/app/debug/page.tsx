'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/dashboard/api/health')
      .then(res => res.json())
      .then(data => setInfo(data))
      .catch(err => setInfo({ error: err.message }));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({
          window: {
            location: window.location.href,
            pathname: window.location.pathname,
            host: window.location.host,
          },
          info,
        }, null, 2)}
      </pre>
    </div>
  );
}
