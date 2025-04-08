import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentStatus {
  type: 'success' | 'error' | 'pending' | 'timeout';
  message: string;
  timestamp: string;
}

export const PaymentStatusMonitor = () => {
  const [statuses, setStatuses] = useState<PaymentStatus[]>([]);

  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      if (event.origin === 'https://nowpayments.io') {
        const status: PaymentStatus = {
          type: event.data.status,
          message: event.data.message,
          timestamp: new Date().toLocaleTimeString()
        };
        setStatuses(prev => [status, ...prev]);
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, []);

  if (statuses.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 max-h-96 overflow-y-auto">
      <div className="space-y-2">
        {statuses.map((status, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 
              shadow-lg animate-slideUp"
          >
            <div className="flex items-start gap-3">
              {status.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {status.type === 'error' && (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              {status.type === 'pending' && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
              )}
              {status.type === 'timeout' && (
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-300">{status.message}</p>
                <p className="text-xs text-gray-500 mt-1">{status.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
