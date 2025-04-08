import { Percent } from 'lucide-react';
import { useTrades } from '../contexts/TradesContext';
import { useEffect, useState } from 'react';

export const WinRateStats = () => {
  const { winRate, wins, losses } = useTrades();
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayRate, setDisplayRate] = useState(winRate);

  // Animate changes to win rate
  useEffect(() => {
    setIsUpdating(true);
    setDisplayRate(winRate);
    const timer = setTimeout(() => setIsUpdating(false), 1000);
    return () => clearTimeout(timer);
  }, [winRate, wins, losses]);

  return (
    <div className="relative group">
      <button className={`flex items-center justify-center gap-1.5 w-auto px-2.5 h-8 rounded-lg 
        bg-gray-700/40 hover:bg-gray-700 border border-gray-600/50 
        hover:border-green-500/30 transition-all duration-300
        ${isUpdating ? 'animate-pulse text-blue-400' : 'text-green-400'}`}
      >
        <Percent className="w-4 h-4" />
        <span className={`text-sm ${isUpdating ? 'animate-[countUpdate_0.5s_ease-out]' : ''}`}>
          {displayRate.toFixed(0)}%
        </span>
      </button>

      <div className="absolute right-0 top-full mt-2 p-3 
        bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity
        pointer-events-none min-w-[140px]"
      >
        <div className="space-y-1 text-sm whitespace-nowrap">
          <p className="text-green-400">Wins: {wins}</p>
          <p className="text-red-400">Losses: {losses}</p>
          <div className="pt-1 mt-1 border-t border-gray-700">
            <p className="text-blue-400">
              Win Rate: {((wins / (wins + losses)) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
