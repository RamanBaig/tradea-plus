const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Webhook handler for NOWPayments IPN (Instant Payment Notifications)
 * This function receives payment notifications from NOWPayments and stores them in Firestore
 */
exports.nowpaymentsWebhook = functions.https.onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error('Invalid request method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log received webhook for debugging
    console.log('NOWPayments webhook received:', {
      headers: req.headers,
      body: req.body,
      time: new Date().toISOString()
    });

    // Get the IPN data from the request body
    const ipnData = req.body;
    
    // Add initial log entry for the webhook
    await addPaymentLog(`Received IPN webhook: ${JSON.stringify(req.body).substring(0, 200)}...`);
    
    // Extract relevant payment data with fallbacks
    const payment_id = ipnData.payment_id || ipnData.id || 'unknown_id';
    const payment_status = ipnData.payment_status || ipnData.status || 'unknown_status';
    const price_amount = parseFloat(ipnData.price_amount) || ipnData.price_amount || 0;
    const price_currency = ipnData.price_currency || ipnData.currency || 'unknown';
    const order_id = ipnData.order_id || ipnData.orderId || ipnData.user_id || ipnData.userId || 'unknown_user';
    
    console.log('Extracted payment data:', {
      payment_id,
      payment_status,
      price_amount,
      price_currency,
      order_id
    });

    // Log payment status
    const logMessage = `Payment ${payment_id} status: ${payment_status}, Amount: ${price_amount} ${price_currency}`;
    console.log(logMessage);
    
    // Store the payment details in Firestore
    await addPaymentLog(
      logMessage,
      order_id,
      undefined,
      ipnData
    );
    
    // Store full payment data for reference
    await addPaymentLog(
      `Full payment data: ${JSON.stringify(ipnData)}`,
      order_id,
      undefined,
      ipnData
    );

    // Always return 200 OK to acknowledge receipt (important for webhooks)
    return res.status(200).json({
      message: 'IPN received successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    try {
      // Log the error to Firestore for debugging
      await addPaymentLog(`Error processing webhook: ${error.message || 'Unknown error'}`);
    } catch (logError) {
      console.error('Failed to log error to Firestore:', logError);
    }
    
    // Still return 200 to prevent NOWPayments from retrying (avoid duplication)
    return res.status(200).json({
      message: 'Received, but error occurred during processing',
      status: 'error'
    });
  }
});

/**
 * Helper function to add payment logs to Firestore
 */
async function addPaymentLog(message, userId, email, paymentData) {
  try {
    // Create a document with required fields
    const logData = {
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };
    
    // Add optional fields if provided
    if (userId) logData.userId = userId;
    if (email) logData.email = email;
    
    if (paymentData) {
      // Extract key payment info for better filtering
      if (paymentData.payment_id) logData.payment_id = paymentData.payment_id;
      if (paymentData.payment_status) logData.payment_status = paymentData.payment_status;
      if (paymentData.order_id) logData.order_id = paymentData.order_id;
      if (paymentData.price_amount) logData.price_amount = paymentData.price_amount;
      if (paymentData.price_currency) logData.price_currency = paymentData.price_currency;
      if (paymentData.pay_address) logData.pay_address = paymentData.pay_address;
      
      // Store the full payment data for reference
      logData.paymentData = paymentData;
    }
    
    // Add the document to the 'payment_logs' collection
    const docRef = await admin.firestore().collection('payment_logs').add(logData);
    console.log('Payment log added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment log:', error);
    throw error;
  }
}