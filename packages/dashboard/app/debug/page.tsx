'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null);
  const [windowInfo, setWindowInfo] = useState<any>(null);

  useEffect(() => {
    // Get window info only on client side
    setWindowInfo({
      location: window.location.href,
      pathname: window.location.pathname,
      host: window.location.host,
    });

    // Fetch health check info
    fetch('/dashboard/api/health')
      .then(res => res.json())
      .then(data => setInfo(data))
      .catch(err => setInfo({ error: err.message }));
  }, []);

  if (!windowInfo) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({
          window: windowInfo,
          info,
        }, null, 2)}
      </pre>
    </div>
  );
}
