import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import type { SavedTrade } from '../types/trade';
import { getUserMetadata, updateUserMetadata } from '../services/userMetadata';

interface TradesContextType {
  trades: SavedTrade[];
  saveTrade: (trade: Omit<SavedTrade, 'id' | 'date'>) => Promise<string>;
  updateTradeResult: (tradeId: string, result: 'WIN' | 'LOSS') => Promise<void>;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  updateWinRateStats: (result: 'WIN' | 'LOSS') => void;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<SavedTrade[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [, setError] = useState<string | null>(null);
  const { user }: { user: UserResource | null } = useUser();

  // Load trades from Clerk metadata
  useEffect(() => {
    const loadTrades = async () => {
      if (!user) return;
      try {
        const metadata = await getUserMetadata(user);
        setTrades((metadata?.trades as SavedTrade[]) || []);
      } catch (error) {
        console.error('Failed to load trades:', error);
        setError('Failed to load your trades');
      }
    };

    loadTrades();
  }, [user]);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const metadata = await getUserMetadata(user);
        const completedTrades = metadata.trades?.filter(t => t.result) || [];
        const winCount = completedTrades.filter(t => t.result === 'WIN').length;
        const lossCount = completedTrades.filter(t => t.result === 'LOSS').length;
        
        setWins(winCount);
        setLosses(lossCount);
        setWinRate(winCount + lossCount > 0 ? (winCount / (winCount + lossCount)) * 100 : 0);
      } catch (error) {
        console.error('Failed to load trading stats:', error);
      }
    };

    loadStats();
  }, [user]);

  const saveTrade = async (trade: Omit<SavedTrade, 'id' | 'date'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const tradeId = crypto.randomUUID();
      const newTrade: SavedTrade = {
        ...trade,
        id: tradeId,
        date: new Date().toISOString(),
      };

      // Get current trades and add new trade at the beginning
      const currentMetadata = await getUserMetadata(user);
      const updatedTrades = [newTrade, ...(currentMetadata.trades || [])];
      
      // Update trades in metadata
      await updateUserMetadata(user, { trades: updatedTrades });
      
      // Update local state
      setTrades(updatedTrades);
      
      return tradeId;
    } catch (error) {
      console.error('Failed to save trade:', error);
      throw new Error('Failed to save trade. Please try again.');
    }
  };

  const updateTradeResult = async (
    tradeId: string, 
    result: 'WIN' | 'LOSS',
    stats?: { pnl: number; pnlPercentage: number; holdTime: number }
  ) => {
    if (!user) throw new Error('User not authenticated');

    const updatedTrades = trades.map(trade => 
      trade.id === tradeId 
        ? { 
            ...trade, 
            result,
            tradeStats: stats,
            lastModified: new Date().toISOString()
          }
        : trade
    );
    
    try {
      await updateUserMetadata(user, { trades: updatedTrades });
      setTrades(updatedTrades);
    } catch (error) {
      console.error('Failed to update trade result:', error);
      throw new Error('Failed to update trade result. Please try again.');
    }
  };

  const updateWinRateStats = async (result: 'WIN' | 'LOSS') => {
    if (!user) return;
    
    // Calculate new stats
    const newWins = result === 'WIN' ? wins + 1 : wins;
    const newLosses = result === 'LOSS' ? losses + 1 : losses;
    const totalTrades = newWins + newLosses;
    const newWinRate = totalTrades > 0 ? (newWins / totalTrades) * 100 : 0;

    try {
      // First update local state for immediate feedback
      setWins(newWins);
      setLosses(newLosses);
      setWinRate(newWinRate);

      // Then update metadata
      await updateUserMetadata(user, {
        tradingStats: {
          wins: newWins,
          losses: newLosses,
          winRate: newWinRate,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to update trading stats:', error);
      // If metadata update fails, revert local state
      await loadStats();
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const metadata = await getUserMetadata(user);
      const stats = metadata.tradingStats || { wins: 0, losses: 0, winRate: 0 };
      setWins(stats.wins);
      setLosses(stats.losses);
      setWinRate(stats.winRate);
    } catch (error) {
      console.error('Failed to load trading stats:', error);
    }
  };

  return (
    <TradesContext.Provider value={{
      trades,
      saveTrade,
      updateTradeResult,
      updateWinRateStats,
      winRate,
      totalTrades: trades.length,
      wins,
      losses,
    }}>
      {children}
    </TradesContext.Provider>
  );
}

export const useTrades = () => {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades must be used within TradesProvider');
  }
  return context;
};
