import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiKeyTracker from "./apiKeyTracker";

// Get API keys from environment variables and register them with the tracker
const API_KEYS = [
  { key: import.meta.env.VITE_GEMINI_API_KEY_1, name: "Original key from Sharjeel" },
  { key: import.meta.env.VITE_GEMINI_API_KEY_2, name: "Key From R Gmail" },
  { key: import.meta.env.VITE_GEMINI_API_KEY_3, name: "Key #2 from Sharjeel" },
  { key: import.meta.env.VITE_GEMINI_API_KEY_4, name: "Azen Gmail key" },
  { key: import.meta.env.VITE_GEMINI_API_KEY_5, name: "Flodisk key" },
  { key: import.meta.env.VITE_GEMINI_API_KEY_6, name: "Tutor key" },
].filter((entry): entry is { key: string; name: string } => Boolean(entry.key));

// Register all keys with the tracker
const keyTracker = ApiKeyTracker.getInstance();
API_KEYS.forEach(({ key, name }) => keyTracker.registerKey(key, name));

let currentKeyIndex = 0;
let failedKeys = new Set<number>();

// Get next available API key
async function getNextApiKey(): Promise<string | null> {
  const startIndex = currentKeyIndex;
  
  do {
    if (failedKeys.size === API_KEYS.length) {
      // All keys have failed
      failedKeys.clear(); // Reset failed keys to try again
      return null;
    }

    const keyEntry = API_KEYS[currentKeyIndex];
    if (!failedKeys.has(currentKeyIndex)) {
      return keyEntry.key;
    }

    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  } while (currentKeyIndex !== startIndex);

  return null;
}

export interface MultiTimeframeAnalysis {
  id?: string;
  tradeId: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionType: 'LONG' | 'SHORT';
  winRate: number;
  reasoning: string;
  riskRewardRatio: number;
  confirmationPoints: string[];
  entryTime?: string;
}

// Add timeout wrapper
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Analysis request timed out. Please try again.'));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
};

export async function analyzeMultipleTimeframes(
  timeframes: { '15M': string; '1H': string }
): Promise<MultiTimeframeAnalysis> {
  try {
    console.log('Starting analysis...');
    
    const cleanBase64 = (dataUrl: string) => {
      return dataUrl.split(',')[1] || dataUrl;
    };

    let attempts = 0;
    const maxAttempts = API_KEYS.length * 2;
    let currentApiKey: string | null = null;

    while (attempts < maxAttempts) {
      currentApiKey = await getNextApiKey();
      if (!currentApiKey) {
        attempts++;
        continue;
      }

      try {
        const genAI = new GoogleGenerativeAI(currentApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log('Model initialized');

        const prompt = `You are a trading analysis AI. Analyze these charts and return ONLY a JSON object. 

STRICT RULES:
1. Always maintain a 1:2 risk to reward ratio
2. Risk (distance from entry to stop loss) must never exceed 5% of entry price
3. Take profit must be 2x the distance of stop loss from entry

Example structure:
{
  "entryPrice": 50000.00,
  "stopLoss": 48750.00,    // 2.5% risk (within 5% limit)
  "takeProfit": 52500.00,  // 5% reward (2x the risk)
  "positionType": "LONG",
  "winRate": 65,
  "riskRewardRatio": 2.0,
  "confirmationPoints": ["Support level at 50000", "Bullish RSI divergence"],
  "reasoning": "Price showing strong support with bullish momentum"
}

Base your analysis on:
- Support/resistance levels
- Trend direction on both timeframes
- Price action patterns
- Volume analysis if visible
- Technical indicators

IMPORTANT: 
- Respond ONLY with the JSON object
- Always calculate stop loss within 5% of entry
- Always set take profit at 2x the stop loss distance`;

        const result = await withTimeout(
          model.generateContent([
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64(timeframes['15M'])
              }
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64(timeframes['1H'])
              }
            }
          ]),
          30000
        );

        const response = await result.response;
        const text = response.text().trim();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }

        try {
          const analysis = JSON.parse(jsonMatch[0]);
          // Validate required fields
          const requiredFields = ['entryPrice', 'stopLoss', 'takeProfit', 'positionType', 'winRate'];
          for (const field of requiredFields) {
            if (!(field in analysis)) {
              throw new Error(`Missing required field: ${field}`);
            }
          }

          // Only track successful API usage after we have valid results
          await keyTracker.incrementUsage(currentApiKey);

          return {
            ...analysis,
            tradeId: crypto.randomUUID(),
            riskRewardRatio: Number(((analysis.takeProfit - analysis.entryPrice) / 
              (analysis.entryPrice - analysis.stopLoss)).toFixed(2))
          };
        } catch (parseError: unknown) {
          console.error('Failed to parse API response:', parseError);
          throw new Error(`Invalid analysis format: ${(parseError as Error)?.message || 'Unknown parse error'}`);
        }

      } catch (error) {
        console.error(`API call failed with key index ${currentKeyIndex}:`, error);
        failedKeys.add(currentKeyIndex);
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        attempts++;
      }
    }

    throw new Error('All API keys exhausted. Please try again later.');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}