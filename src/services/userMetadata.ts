import type { UserResource } from '@clerk/types';
import type { SavedTrade } from '../types/trade';

export interface UserMetadata {
  isPremium: boolean;
  premiumActivatedAt?: string;
  paymentId?: string;
  paymentStatus?: 'pending' | 'confirmed' | 'finished';
  analysisCount: number;
  theme: 'dark' | 'light';
  trades: SavedTrade[];
  settings?: {
    preferredTimeframes?: string[];
    notifications?: boolean;
  };
  tradingStats?: {
    wins: number;
    losses: number;
    winRate: number;
    lastUpdated: string;
  };
  supportMessages?: Array<{
    messageId: string;
    originalMessage: string;
    replies: Array<{
      id: string;
      message: string;
      createdAt: string;
      isAdmin: boolean;
    }>;
    createdAt: string;
  }>;
}

const DEFAULT_METADATA: UserMetadata = {
  isPremium: false,
  paymentStatus: undefined,
  analysisCount: 0,
  theme: 'dark',
  trades: [],
  settings: {
    preferredTimeframes: ['15M', '1H'],
    notifications: true
  },
  tradingStats: {
    wins: 0,
    losses: 0,
    winRate: 0,
    lastUpdated: new Date().toISOString()
  },
  supportMessages: []
};

export async function getUserMetadata(user: UserResource): Promise<UserMetadata> {
  const metadata = await user.unsafeMetadata;
  return {
    ...DEFAULT_METADATA,
    ...metadata
  } as UserMetadata;
}

export async function updateUserMetadata(user: UserResource, updates: Partial<UserMetadata>) {
  try {
    const currentMetadata = await getUserMetadata(user);
    await user.update({
      unsafeMetadata: {
        ...currentMetadata,
        ...updates
      }
    });
  } catch (error) {
    console.error('Failed to update user metadata:', error);
    throw new Error('Failed to save your data. Please try again.');
  }
}

export async function updateUserTrades(user: UserResource, trades: SavedTrade[]) {
  await updateUserMetadata(user, { trades });
}

// Add new function to update trading stats
export async function updateTradingStats(user: UserResource, stats: {
  wins: number;
  losses: number;
  winRate: number;
}) {
  try {
    const currentMetadata = await getUserMetadata(user);
    await user.update({
      unsafeMetadata: {
        ...currentMetadata,
        tradingStats: {
          ...stats,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Failed to update trading stats:', error);
    throw new Error('Failed to update trading statistics');
  }
}

// Add new function to save support message to metadata
export async function saveSupportMessageToMetadata(
  user: UserResource, 
  messageId: string,
  originalMessage: string,
  reply: { id: string; message: string; createdAt: string; isAdmin: boolean }
) {
  try {
    const currentMetadata = await getUserMetadata(user);
    const supportMessages = currentMetadata.supportMessages || [];
    
    const existingMessageIndex = supportMessages.findIndex(m => m.messageId === messageId);
    
    if (existingMessageIndex >= 0) {
      // Update existing message
      supportMessages[existingMessageIndex].replies.push(reply);
    } else {
      // Add new message
      supportMessages.push({
        messageId,
        originalMessage,
        replies: [reply],
        createdAt: new Date().toISOString()
      });
    }

    await updateUserMetadata(user, { 
      supportMessages: supportMessages 
    });

    return true;
  } catch (error) {
    console.error('Failed to save support message to metadata:', error);
    return false;
  }
}
