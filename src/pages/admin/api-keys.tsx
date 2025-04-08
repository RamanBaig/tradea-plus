import { useState } from 'react';
import { ApiKeyUsage } from '../../components/ApiKeyUsage';
import { RotateCw } from 'lucide-react';

export const ApiKeysPage = () => {
  const [key, setKey] = useState(0); // Used to force re-render ApiKeyUsage
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force re-render of ApiKeyUsage by changing the key
    setKey(prev => prev + 1);
    // Reset refresh state after animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="pt-24 px-8 pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">API Keys Management</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 
              rounded transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RotateCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <ApiKeyUsage key={key} />
      </div>
    </div>
  );
};