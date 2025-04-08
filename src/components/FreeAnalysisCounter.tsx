import { AlertCircle } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { FREE_ANALYSES_LIMIT } from '../constants/limits';

export const FreeAnalysisCounter = () => {
  const { analysisCount, isPremium } = usePremiumStatus();
  const remainingAttempts = Math.max(0, FREE_ANALYSES_LIMIT - analysisCount);

  if (isPremium) return null;

  return (
    <div className="relative group">
      <button className={`flex items-center justify-center gap-1.5 w-auto px-2.5 h-8 rounded-lg 
        ${remainingAttempts === 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
          remainingAttempts <= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
          'bg-gray-700/40 text-blue-400 border-gray-600/50'} 
        hover:bg-gray-700 border hover:border-blue-500/30 
        transition-all duration-300`}
      >
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{remainingAttempts}</span>
      </button>

      <div className="absolute right-0 top-full mt-2 p-3 
        bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity
        pointer-events-none min-w-[180px] text-sm"
      >
        <p className="text-gray-300">
          {remainingAttempts === 0 ? 
            'No analyses remaining' : 
            `${remainingAttempts} free ${remainingAttempts === 1 ? 'analysis' : 'analyses'} remaining`}
        </p>
      </div>
    </div>
  );
};