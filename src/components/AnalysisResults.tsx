import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Target, XCircle, CheckCircle, BarChart2, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { MultiTimeframeAnalysis } from '../services/gemini';
import { useTrades } from '../contexts/TradesContext';
import type { TradeType } from '../types/trade';

interface AnalysisResultsProps {
  analysis: MultiTimeframeAnalysis;
  charts: {
    '5M'?: string;
    '15M': string;
    '1H': string;
    '4H'?: string;
  };
  tradeType: TradeType;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, charts, tradeType }) => {
  const { saveTrade, updateTradeResult, updateWinRateStats } = useTrades();
  const [isSaving, setIsSaving] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const handleResult = async (result: 'WIN' | 'LOSS') => {
    setIsSaving(true);
    try {
      // Save the trade first
      const savedTradeId = await saveTrade({
        analysis: {
          entryPrice: analysis.entryPrice,
          stopLoss: analysis.stopLoss,
          takeProfit: analysis.takeProfit,
          positionType: analysis.positionType,
          winRate: analysis.winRate,
          reasoning: analysis.reasoning,
          riskRewardRatio: analysis.riskRewardRatio,
          confirmationPoints: analysis.confirmationPoints,
          metadata: {
            confidence: analysis.winRate,
            timeOfDay: new Date().toLocaleTimeString(),
          }
        },
        charts,
        tradeType,
        lastModified: new Date().toISOString(),
      });

      // Update trade result and wait for it to complete
      await updateTradeResult(savedTradeId, result);
      
      // Update win rate stats and wait for it to complete
      await updateWinRateStats(result);

      // Only set submitted after all async operations complete
      setResultSubmitted(true);
    } catch (error) {
      console.error('Failed to save trade result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
      <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
      
      <div className="space-y-6">
        {/* Position Type and Win Rate */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            analysis.positionType === 'LONG' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {analysis.positionType === 'LONG' ? (
              <ArrowUpCircle className="w-5 h-5" />
            ) : (
              <ArrowDownCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{analysis.positionType}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
            <BarChart2 className="w-5 h-5" />
            <span className="font-semibold">Win Rate: {analysis.winRate}%</span>
          </div>
        </div>

        {/* Price Levels */}
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-white" />
            <span className="text-gray-300">Entry Price:</span>
            <span className="text-white font-semibold">${analysis.entryPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Take Profit:</span>
            <span className="text-green-400 font-semibold">${analysis.takeProfit.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300">Stop Loss:</span>
            <span className="text-red-400 font-semibold">${analysis.stopLoss.toFixed(2)}</span>
          </div>
        </div>

        {/* Risk/Reward and Confirmation Points */}
        <div className="space-y-3">
          <div className="pt-3 border-t border-gray-700">
            <span className="text-gray-300">Risk/Reward Ratio:</span>
            <span className="ml-2 text-blue-400 font-semibold">1:{analysis.riskRewardRatio}</span>
          </div>
          
          {analysis.confirmationPoints && analysis.confirmationPoints.length > 0 && (
            <div className="pt-3 border-t border-gray-700">
              <h3 className="text-white font-medium mb-2">Confirmation Points:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {analysis.confirmationPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Save and Result Buttons */}
      <div className="mt-6 space-y-3">
        {!resultSubmitted ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResult('WIN')}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                bg-green-500/20 hover:bg-green-500/30 text-green-400
                rounded-lg transition-all duration-300 transform hover:scale-[1.02]
                border border-green-500/30 hover:border-green-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  Win
                </>
              )}
            </button>
            <button
              onClick={() => handleResult('LOSS')}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                bg-red-500/20 hover:bg-red-500/30 text-red-400
                rounded-lg transition-all duration-300 transform hover:scale-[1.02]
                border border-red-500/30 hover:border-red-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ThumbsDown className="w-5 h-5" />
                  Loss
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            Trade result recorded! Check your win rate in the top right.
          </div>
        )}
      </div>
    </div>
  );
};

