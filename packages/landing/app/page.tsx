export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">OpaqueAI Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Privacy Statistics</h2>
            <div className="space-y-2">
              <p>Sensitive Data Detected: 0</p>
              <p>Cached Responses: 0</p>
              <p>Privacy Score: 100%</p>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <p>Local LLM: Active</p>
              <p>Supabase Connection: Active</p>
              <p>Extension Status: Active</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
