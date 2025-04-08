export interface SavedTrade {
  id: string;
  date: string;
  charts: {
    '5M'?: string;
    '15M': string;
    '1H': string;
    '4H'?: string;
  };
  analysis: {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    positionType: 'LONG' | 'SHORT';
    winRate: number;
    reasoning: string;
    riskRewardRatio: number;
    confirmationPoints: string[];
    metadata?: {
      confidence: number;
      timeOfDay?: string;
      market?: string;
    };
  };
  result?: 'WIN' | 'LOSS';
  profitability?: 'HIGH' | 'MEDIUM' | 'LOW';
  tradeType: TradeType;
  lastModified: string;
  positionSize?: number;
  tradeStats?: {
    pnl?: number;
    pnlPercentage?: number;
    holdTime?: number;
  };
}

export type TradeFilter = {
  result?: 'WIN' | 'LOSS';
  timeframe?: '5M' | '15M' | '1H' | '4H';
  profitability?: 'HIGH' | 'MEDIUM' | 'LOW';
  positionType?: 'LONG' | 'SHORT';
};

// Add this interface for the trades list component
export interface Trade {
  id: string;
  date: string;
  entryPrice: number;
  exitPrice?: number;
  positionType: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  profitLoss?: number;
  charts?: {
    '5M'?: string;
    '15M': string;
    '1H': string;
    '4H'?: string;
  };
}

export type TradeType = 'GOOD_RESULTS' | 'BEST_RESULTS';