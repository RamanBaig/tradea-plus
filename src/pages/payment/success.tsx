import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useNavigate } from 'react-router-dom';
import { updateUserMetadata } from '../../services/userMetadata';
import { CheckCircle2 } from 'lucide-react';
import { verifyPaymentStatus } from '../../services/nowpayments';
import { addPaymentLog } from '../../services/firebase';

export const PaymentSuccessPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [, setVerified] = useState(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!user) return;

      // Get payment ID from URL params
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get('payment_id');
      
      if (!paymentId) {
        navigate('/app');
        return;
      }

      try {
        // Log payment verification attempt
        await addPaymentLog(`Verifying payment ${paymentId}`, user.id);

        // Verify payment first
        const isValid = await verifyPaymentStatus(paymentId);
        if (!isValid) {
          await addPaymentLog(`Payment verification failed for ${paymentId}`, user.id);
          throw new Error('Payment verification failed');
        }

        setVerified(true);
        await updateUserMetadata(user, { 
          isPremium: true,
          premiumActivatedAt: new Date().toISOString(),
          paymentId
        });

        // Log successful payment
        await addPaymentLog(`Payment ${paymentId} verified and activated`, user.id);

        setTimeout(() => {
          navigate('/app');
        }, 3000);
      } catch (error) {
        console.error('Failed to verify payment:', error);
        navigate('/payment/failed');
      }
    };

    handlePaymentSuccess();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-4 p-8">
        <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="text-gray-400">
          Thank you for upgrading to premium. You'll be redirected shortly...
        </p>
      </div>
    </div>
  );
};