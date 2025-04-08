import type { NextApiRequest, NextApiResponse } from 'next';
import { addPaymentLog } from '../../../services/firebase';

// Define response types
type ResponseData = {
  message: string;
  status?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Enhanced debug logging
    console.log('[NOWPayments Webhook] Request received:', {
      method: req.method,
      url: req.url,
      body: JSON.stringify(req.body),
      headers: JSON.stringify(req.headers),
      time: new Date().toISOString()
    });
    
    // Log the raw IPN request to Firestore
    const logId = await addPaymentLog(`Received IPN webhook at ${new Date().toISOString()}: ${JSON.stringify(req.body)}`);
    console.log('[NOWPayments Webhook] Added initial log with ID:', logId);
    
    // Verify the IPN authentication
    const ipnData = req.body;
    
    // Get the signature from the headers
    const signature = req.headers['x-nowpayments-sig'] as string;
    
    console.log('[NOWPayments Webhook] IPN Signature:', signature);
    
    // Since this is a new implementation, temporarily skip signature verification
    // but still log if it's missing
    if (!signature) {
      console.log('[NOWPayments Webhook] Missing signature in IPN webhook');
      await addPaymentLog('Missing signature in IPN webhook, but continuing processing');
    }

    // Enhanced logging to see exactly what we're receiving
    console.log('[NOWPayments Webhook] Raw IPN Data:', ipnData);
    
    // Extract payment data with very permissive fallbacks - handle both standard and ALL_STRINGS format
    const payment_id = ipnData.payment_id || ipnData.payment_id?.toString() || ipnData.id || 'unknown_id';
    const payment_status = ipnData.payment_status || ipnData.status || 'unknown_status';
    const price_amount = parseFloat(ipnData.price_amount) || ipnData.price_amount || 0;
    const price_currency = ipnData.price_currency || ipnData.currency || 'unknown';
    const order_id = ipnData.order_id || ipnData.orderId || ipnData.user_id || ipnData.userId || 'unknown_user';
    
    console.log('[NOWPayments Webhook] Parsed payment data:', {
      payment_id,
      payment_status,
      price_amount,
      price_currency,
      order_id
    });

    // Log ALL payment data regardless of status
    const logMessage = `Payment ${payment_id} status: ${payment_status}, Amount: ${price_amount} ${price_currency}`;
    console.log('[NOWPayments Webhook]', logMessage);
    
    // This should add a record to Firestore with payment details
    const detailsLogId = await addPaymentLog(
      logMessage,
      order_id,
      undefined,
      ipnData
    );
    console.log('[NOWPayments Webhook] Added payment details log with ID:', detailsLogId);
    
    // Store the payment data again with full details for display
    const fullLogId = await addPaymentLog(
      `Full payment data: ${JSON.stringify(ipnData)}`,
      order_id,
      undefined,
      ipnData
    );
    console.log('[NOWPayments Webhook] Added full payment data log with ID:', fullLogId);

    // Always send a 200 response to NOWPayments to acknowledge receipt
    return res.status(200).json({
      message: 'IPN received successfully',
      status: 'success'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[NOWPayments Webhook] ERROR handling webhook:', errorMessage);
    console.error('[NOWPayments Webhook] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    try {
      await addPaymentLog(`Error processing IPN webhook: ${errorMessage}`);
    } catch (logError) {
      console.error('[NOWPayments Webhook] Failed to log error to Firestore:', logError);
    }
    
    return res.status(500).json({
      message: `Error processing IPN: ${errorMessage}`,
      status: 'error'
    });
  }
}