import React from 'react';
import { SpaceBackground } from '../SpaceBackground';
import { useTrades } from '../../contexts/TradesContext';
import { 
  Clock, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign,
  Calendar,
  BarChart2,
  Target,
  TrendingUp
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { trades } = useTrades();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <>
      <SpaceBackground />
      <div className="content-layer relative z-10">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Trade History</h1>
            
            {trades.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No trades available yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Your trading history will appear here once you start analyzing charts
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {trades.map((trade) => (
                  <div 
                    key={trade.id} 
                    className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Trade Details */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {trade.analysis.positionType === 'LONG' ? (
                              <ArrowUpCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <ArrowDownCircle className="w-5 h-5 text-red-400" />
                            )}
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              trade.analysis.positionType === 'LONG' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.analysis.positionType}
                            </span>
                            {trade.result && (
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                trade.result === 'WIN'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.result}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(trade.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Trade Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                              <Target className="w-4 h-4" />
                              <span className="text-xs">Entry</span>
                            </div>
                            <span className="text-white font-medium">
                              {formatCurrency(trade.analysis.entryPrice)}
                            </span>
                          </div>
                          
                          <div className="p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-xs">Take Profit</span>
                            </div>
                            <span className="text-green-400 font-medium">
                              {formatCurrency(trade.analysis.takeProfit)}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                              <BarChart2 className="w-4 h-4" />
                              <span className="text-xs">Win Rate</span>
                            </div>
                            <span className="text-blue-400 font-medium">
                              {trade.analysis.winRate}%
                            </span>
                          </div>

                          {trade.positionSize && (
                            <div className="p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs">Position Size</span>
                              </div>
                              <span className="text-white font-medium">
                                {formatCurrency(trade.positionSize)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Additional Stats for Completed Trades */}
                        {trade.tradeStats && (
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
                            <div>
                              <span className="text-gray-400 text-sm">PnL</span>
                              <p className={`font-medium ${
                                (trade.tradeStats.pnl || 0) >= 0 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {formatCurrency(trade.tradeStats.pnl || 0)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">PnL %</span>
                              <p className={`font-medium ${
                                (trade.tradeStats.pnlPercentage || 0) >= 0 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {trade.tradeStats.pnlPercentage?.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400 text-sm">Hold Time</span>
                              <p className="text-white font-medium">
                                {Math.floor((trade.tradeStats.holdTime || 0) / 60)}m
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
                        <div>
                          <p className="text-sm text-gray-400 mb-2">15M Chart</p>
                          <img 
                            src={trade.charts['15M']} 
                            alt="15M" 
                            className="rounded-lg w-full h-auto object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-2">1H Chart</p>
                          <img 
                            src={trade.charts['1H']} 
                            alt="1H" 
                            className="rounded-lg w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TradesPage;
