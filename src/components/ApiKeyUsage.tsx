import { useState, useEffect } from 'react';
import { RefreshCw, Key } from 'lucide-react';
import ApiKeyTracker from '../services/apiKeyTracker';

export const ApiKeyUsage = () => {
  const [keyUsage, setKeyUsage] = useState<Array<{
    key: string;
    used: number;
    remaining: number;
    name: string;
  }>>([]);

  useEffect(() => {
    updateUsage();
  }, []);

  const updateUsage = async () => {
    const usage = await ApiKeyTracker.getInstance().getAllKeyUsage();
    setKeyUsage(usage);
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">API Key Usage</h3>
        <button 
          onClick={updateUsage}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          title="Refresh usage stats"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {keyUsage.map(({ key, used, remaining, name }) => (
          <div key={key} className="glass-panel p-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Key className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{name}</h4>
                  <span className="text-sm text-gray-400">
                    {remaining} left today
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ 
                      width: `${(used / (used + remaining)) * 100}%`,
                      backgroundColor: remaining < 100 ? '#ef4444' : '#3b82f6'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{used} used</span>
                  <span className="text-xs text-gray-500">1500 daily limit</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};