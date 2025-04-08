import type { UserResource } from '@clerk/types';
import crypto from 'crypto';

interface CreatePaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  pay_amount: number;
  created_at: string;
  payment_url: string;
}

const NOWPAYMENTS_API_URL = import.meta.env.VITE_NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_API_KEY = import.meta.env.VITE_NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = import.meta.env.VITE_NOWPAYMENTS_IPN_SECRET;

export async function createOneTimePayment(user: UserResource): Promise<CreatePaymentResponse> {
  try {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: 2.99,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: user.id,
        order_description: 'TradeA+ Premium Access',
        ipn_callback_url: `${window.location.origin}/api/nowpayments/webhook`,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
}

export async function verifyPaymentStatus(paymentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data.payment_status === 'finished' || data.payment_status === 'confirmed';
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}

// New function to verify IPN signature
export function verifyIpnSignature(payload: string, signature: string): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.warn('IPN secret not configured, skipping signature verification');
    return true;
  }
  
  try {
    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
    const calculated = hmac.update(payload).digest('hex');
    return calculated === signature;
  } catch (error) {
    console.error('IPN signature verification failed:', error);
    return false;
  }
}