import { trackApiKeyUsage, getApiKeyUsageStats, cleanupOldApiKeyUsage } from './firebase';

// Daily limit for free Gemini API keys (1500 requests per day)
const DAILY_LIMIT = 1500;

class ApiKeyTracker {
  private static instance: ApiKeyTracker;
  private usageCache: Map<string, { used: number; name: string }>;
  private lastFetch: Date;
  private currentDay: number;
  private cleanupTimeout: NodeJS.Timeout | null;
  private keyNames: Map<string, string>;

  private constructor() {
    this.usageCache = new Map();
    this.keyNames = new Map();
    this.lastFetch = new Date(0);
    this.currentDay = new Date().getDate();
    this.cleanupTimeout = null;
    this.scheduleNextCleanup();
  }

  private getEstTime(date: Date = new Date()): Date {
    // Get the timezone offset in minutes for EST (UTC-4 for EDT, UTC-5 for EST)
    const estTimezoneOffset = -4 * 60; // Using EDT for now, we can add automatic DST detection if needed
    
    // Get the local timezone offset in minutes
    const localOffset = date.getTimezoneOffset();
    
    // Calculate the difference between local and EST time in milliseconds
    const offsetDiff = (localOffset - estTimezoneOffset) * 60 * 1000;
    
    // Create a new date adjusted to EST
    return new Date(date.getTime() - offsetDiff);
  }

  private scheduleNextCleanup() {
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
    }

    const now = new Date();
    const estNow = this.getEstTime(now);
    
    // Calculate next midnight in EST
    const estMidnight = new Date(estNow);
    estMidnight.setHours(24, 0, 0, 0);
    
    // Convert EST midnight back to local time
    const localOffset = now.getTimezoneOffset() * 60 * 1000;
    const estOffset = -4 * 60 * 60 * 1000; // EDT offset in milliseconds
    const offsetDiff = localOffset + estOffset;
    const localMidnight = new Date(estMidnight.getTime() + offsetDiff);
    
    // Calculate time until next cleanup
    const timeUntilMidnight = localMidnight.getTime() - now.getTime();

    // Log timezone debugging info
    console.log('Current time (Local):', now.toISOString());
    console.log('Current time (EST):', estNow.toISOString());
    console.log('Next cleanup (EST):', estMidnight.toISOString());
    console.log('Time until cleanup:', timeUntilMidnight / (1000 * 60 * 60), 'hours');

    // Schedule cleanup at midnight EST
    this.cleanupTimeout = setTimeout(async () => {
      await this.handleDayChange();
      this.scheduleNextCleanup(); // Schedule next day's cleanup
    }, timeUntilMidnight);
  }

  private async handleDayChange() {
    try {
      // Clean up old data
      await cleanupOldApiKeyUsage();
      
      // Reset cache
      this.usageCache.clear();
      this.lastFetch = new Date(0);
      this.currentDay = new Date().getDate();
      
      // Fetch fresh data
      await this.refreshUsageStats();
    } catch (error) {
      console.error('Error handling day change:', error);
    }
  }

  private async refreshUsageStats() {
    try {
      // Check if day has changed
      const currentDay = new Date().getDate();
      if (currentDay !== this.currentDay) {
        await this.handleDayChange();
        return;
      }

      const stats = await getApiKeyUsageStats();
      this.usageCache.clear();
      
      // First, initialize all registered keys with 0 usage
      this.keyNames.forEach((name, key) => {
        this.usageCache.set(key, {
          used: 0,
          name
        });
      });

      // Then update with actual usage data
      Object.entries(stats).forEach(([key, data]) => {
        this.usageCache.set(key, {
          used: data.used || 0,
          name: this.keyNames.get(key) || data.name || 'Unknown Key'
        });
      });

      this.lastFetch = new Date();
    } catch (error) {
      console.error('Failed to refresh API key usage stats:', error);
    }
  }

  public static getInstance(): ApiKeyTracker {
    if (!ApiKeyTracker.instance) {
      ApiKeyTracker.instance = new ApiKeyTracker();
    }
    return ApiKeyTracker.instance;
  }

  public registerKey(key: string, name: string) {
    this.keyNames.set(key, name);
  }

  public async incrementUsage(key: string): Promise<boolean> {
    // Refresh stats if cache is older than 30 seconds
    if (Date.now() - this.lastFetch.getTime() > 30000) {
      await this.refreshUsageStats();
    }

    const cachedUsage = this.usageCache.get(key);
    if (cachedUsage && cachedUsage.used >= DAILY_LIMIT) {
      return false;
    }

    const keyName = this.keyNames.get(key) || 'Unknown Key';
    const success = await trackApiKeyUsage(key, keyName);
    
    if (success) {
      // Update local cache
      this.usageCache.set(key, {
        used: (cachedUsage?.used || 0) + 1,
        name: keyName
      });
    }
    
    return success;
  }

  public async getAllKeyUsage(): Promise<Array<{ key: string; used: number; remaining: number; name: string }>> {
    // Refresh data if it's been more than 30 seconds
    if (Date.now() - this.lastFetch.getTime() > 30000) {
      await this.refreshUsageStats();
    }

    // Combine registered keys and usage data
    const allKeys = new Set([...this.keyNames.keys(), ...this.usageCache.keys()]);
    
    return Array.from(allKeys).map(key => {
      const usage = this.usageCache.get(key);
      const name = this.keyNames.get(key) || usage?.name || 'Unknown Key';
      const used = usage?.used || 0;
      return {
        key,
        used,
        remaining: DAILY_LIMIT - used,
        name
      };
    });
  }
}

export default ApiKeyTracker;