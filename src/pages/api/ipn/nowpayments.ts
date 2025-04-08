import type { NextApiRequest, NextApiResponse } from 'next';
import { addPaymentLog } from '../../../services/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Enhanced logging for Render deployment
    console.log(`IPN Request received at ${new Date().toISOString()}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Extract the payment data from the request body
    const paymentData = req.body;
    
    // Validate the IPN data
    if (!paymentData || !paymentData.payment_id) {
      console.error('Invalid IPN data received:', paymentData);
      return res.status(400).json({ message: 'Invalid IPN data' });
    }

    // Extract key information
    const {
      payment_id,
      payment_status,
      price_amount,
      price_currency,
      order_id,
    } = paymentData;

    // Log deployment environment info
    console.log(`Processing payment on server: ${process.env.NEXT_PUBLIC_API_URL || 'development'}`);
    
    // Create a log message
    const logMessage = `Payment ${payment_id} status: ${payment_status}, Amount: ${price_amount} ${price_currency}`;
    
    // Store the payment in Firebase
    await addPaymentLog(
      logMessage,
      order_id, // This should be your user ID
      undefined,
      paymentData
    );

    console.log(`Successfully processed payment ${payment_id}`);

    // Send a success response back to NOWPayments
    res.status(200).json({ success: true });
    
  } catch (error) {
    // Enhanced error logging for Render deployment
    console.error('Error processing IPN webhook:');
    console.error(error);
    
    // Log the error but still return 200 to prevent NOWPayments from retrying
    // (you can change this behavior if you want retries)
    await addPaymentLog(
      `Error processing IPN: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'system',
      undefined,
      { error: String(error) }
    );
    
    res.status(200).json({ success: false, error: 'Error processing webhook' });
  }
}
