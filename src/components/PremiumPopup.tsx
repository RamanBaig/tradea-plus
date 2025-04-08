import React, { useState } from 'react';
import { CreditCard, X, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface PremiumPopupProps {
  onUpgrade: () => void | Promise<void>;
  onCancel: () => void;
}

export const PremiumPopup: React.FC<PremiumPopupProps> = ({ onCancel }) => {
  const { user } = useUser();
  const [isProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) return;
    
    // Post message for starting payment
    window.postMessage({
      status: 'pending',
      message: 'Starting payment process...'
    }, window.location.origin);
    
    const shopId = import.meta.env.VITE_NOWPAYMENTS_SHOP_ID;
    const checkoutUrl = `https://nowpayments.io/payment/?iid=${shopId}&product_id=TRADEA_PREMIUM&order_id=${user.id}&success_url=${window.location.origin}/payment/success`;
    
    // Open payment window and track its status
    const paymentWindow = window.open(checkoutUrl, '_blank');
    
    // Monitor payment window status
    const checkWindowClosed = setInterval(() => {
      if (paymentWindow?.closed) {
        clearInterval(checkWindowClosed);
        window.postMessage({
          status: 'timeout',
          message: 'Payment window was closed'
        }, window.location.origin);
      }
    }, 1000);
  };

  return (
    <>
      {/* Full-screen semi-transparent backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
      
      <div className="absolute inset-x-0 top-0 z-[9999] flex items-center justify-center min-h-screen">
        <div className="relative glass-panel p-8 rounded-2xl max-w-md w-[95%] mx-4 
          border border-[#00ff9d]/20 shadow-[0_8px_32px_rgba(0,255,157,0.2)]
          animate-[fadeIn_0.3s_ease-out,slideUp_0.3s_ease-out,float_3s_ease-in-out_infinite]">
          <button
            onClick={onCancel}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-gray-800/90 
              hover:bg-gray-700/90 transition-colors
              border border-[#00ff9d]/20 hover:border-[#00ff9d]/40
              text-[#00ff9d]">
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-[#00ff9d]/10 rounded-full mb-4
              ring-4 ring-[#00ff9d]/5">
              <CreditCard className="w-10 h-10 text-[#00ff9d]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-[#00ff9d] bg-clip-text text-transparent">
              Upgrade to Premium
            </h2>
            <p className="text-gray-300 leading-relaxed">
              You've used all your free analyses. 
              <br />Unlock unlimited access for just
              <span className="font-semibold text-[#00ff9d]"> $2.99</span>!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30
                rounded-lg font-semibold text-[#00ff9d]
                transform hover:scale-[1.02] transition-all duration-300
                border border-[#00ff9d]/30 hover:border-[#00ff9d]/50
                shadow-lg shadow-[#00ff9d]/20 disabled:opacity-50 
                disabled:cursor-not-allowed disabled:transform-none">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Pay Now & Unlock'
              )}
            </button>
            
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 bg-gray-800/50 hover:bg-gray-700/50
                rounded-lg font-medium text-gray-300
                border border-gray-600/50 hover:border-[#00ff9d]/20
                transition-all duration-300 disabled:opacity-50 
                disabled:cursor-not-allowed">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
