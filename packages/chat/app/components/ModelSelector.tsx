'use client';

import { useChatStore } from '../lib/store';

export function ModelSelector() {
  const { modelPreference, setModelPreference } = useChatStore();

  return (
    <div className="p-4 border-b">
      <label className="block text-sm font-medium text-gray-700">
        Model Preference
      </label>
      <select
        value={modelPreference}
        onChange={(e) => setModelPreference(e.target.value as 'local' | 'cloud')}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        <option value="cloud">Cloud (ChatGPT/Claude)</option>
        <option value="local">Local (WebGPU-powered)</option>
      </select>
      <p className="mt-2 text-sm text-gray-500">
        Local processing is automatically enabled for sensitive information
      </p>
    </div>
  );
}
