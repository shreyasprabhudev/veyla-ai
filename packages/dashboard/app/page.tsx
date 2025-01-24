export default function Home() {
  // Sample data - replace with actual data from your backend
  const data = {
    totalProtected: 1250,
    byPlatform: {
      'ChatGPT': 450,
      'Claude': 350,
      'Gemini': 300,
      'Other': 150
    }
  };

  const maxValue = Math.max(...Object.values(data.byPlatform));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-xl font-bold">V</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">VeylaAI Dashboard</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Protected Messages</h2>
            <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-medium">
              Total: {data.totalProtected}
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(data.byPlatform).map(([platform, count]) => (
              <div key={platform} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{platform}</span>
                  <span className="text-gray-500">{count} messages</span>
                </div>
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(count / maxValue) * 100}%`,
                      background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { time: '2 mins ago', platform: 'Claude', type: 'Credit Card' },
                { time: '5 mins ago', platform: 'ChatGPT', type: 'SSN' },
                { time: '10 mins ago', platform: 'Gemini', type: 'Phone Number' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.platform}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Protection Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-purple-600">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Response Time</span>
                <span className="text-sm font-medium text-purple-600">120ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-purple-600">45</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
