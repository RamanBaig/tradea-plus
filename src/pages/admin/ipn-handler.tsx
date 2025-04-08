import { useState, useEffect } from 'react';
import { getPaymentLogs, getAllPaymentData, addPaymentLog } from '../../services/firebase';
import type { PaymentLog } from '../../services/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

export const IpnHandlerPage = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentLog[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentLog | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Function to perform a test POST to the webhook endpoint
  const testWebhook = async () => {
    try {
      setError(null);
      
      // Create test data that mimics a NOWPayments IPN notification
      const testData = {
        payment_id: `test_${Date.now()}`,
        payment_status: 'waiting',
        price_amount: 2.99,
        price_currency: 'usd',
        pay_amount: 0.0001,
        pay_currency: 'btc',
        order_id: 'test_user_id',
        order_description: 'TradeA+ Premium Access',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Use a direct mock approach instead of API call
      // This simulates receiving webhook data without making an actual API call
      console.log('Simulating webhook with test data:', testData);
      
      // Directly call the addPaymentLog function to add test data to Firestore
      const paymentId = testData.payment_id;
      await addPaymentLog(
        `TEST: Payment ${paymentId} status: ${testData.payment_status}, Amount: ${testData.price_amount} ${testData.price_currency}`,
        testData.order_id,
        undefined,
        testData
      );
      
      // Add a second log with full data
      await addPaymentLog(
        `TEST: Full payment data: ${JSON.stringify(testData)}`,
        testData.order_id,
        undefined,
        testData
      );
      
      // Display success message
      setLogs(prev => [`TEST: Created test IPN data in Firestore. Payment ID: ${paymentId}`, ...prev]);
      
      // Refresh payment data to show the test data
      await refreshPaymentLogs();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to create test data: ${errorMessage}`);
      console.error('Test webhook error:', error);
    }
  };

  // Function to clear all test data from Firestore
  const clearTestData = async () => {
    try {
      setError(null);
      
      // In a real implementation, you'd need a server endpoint to do this safely
      // For now, we'll just refresh and notify the user this is a placeholder
      setLogs(prev => ["Note: Clearing test data requires server-side implementation", ...prev]);
      
      await refreshPaymentLogs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to clear test data: ${errorMessage}`);
    }
  };

  // Refresh payment logs function with debug logging
  const refreshPaymentLogs = async () => {
    try {
      console.log('Starting payment logs refresh');
      setIsFetching(true);
      setError(null);
      
      // Get text logs
      console.log('Fetching text logs');
      const existingLogs = await getPaymentLogs();
      console.log(`Fetched ${existingLogs.length} text logs`);
      setLogs(existingLogs);
      
      // Get full payment data objects
      console.log('Fetching payment data');
      const payments = await getAllPaymentData();
      console.log(`Fetched ${payments.length} payment data objects`);
      console.log('Sample payment data:', payments.length > 0 ? payments[0] : 'No payments');
      setPaymentData(payments);
      
      setLastRefreshed(new Date());
      setIsFetching(false);
      console.log('Refresh complete at', new Date().toISOString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error loading payment logs:", error);
      setError(`Failed to load payment data: ${errorMessage}`);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Load payment logs when component mounts
    refreshPaymentLogs();
    
    // Set up automatic refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(refreshPaymentLogs, 10000); // Refresh every 10 seconds
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    refreshPaymentLogs();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'waiting': return 'bg-yellow-500';
      case 'confirming': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'sending': return 'bg-purple-500';
      case 'partially_paid': return 'bg-orange-500';
      case 'finished': return 'bg-green-700';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
      case 'expired': return 'bg-red-700';
      default: return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Convert Firebase timestamp to JS Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return String(timestamp);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">NOWPayments IPN Handler</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Control buttons */}
      <div className="mb-6 gap-2">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isFetching ? 'Refreshing...' : 'Refresh Payment Data'}
          </Button>
          
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 ${autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Button>
          
          <Button 
            onClick={testWebhook}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700"
          >
            Test Webhook
          </Button>
          
          <Button 
            onClick={clearTestData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700"
          >
            Clear Test Data
          </Button>
        </div>
        
        <div className="text-sm text-gray-400">
          Last refreshed: {lastRefreshed.toLocaleTimeString()} 
          {autoRefresh && ' (Auto-refreshing every 10 seconds)'}
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          To see webhook data with proper payment_id field, use the "Test Webhook" button to send test data.
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment logs list */}
        <div className="md:col-span-1">
          <Card className="bg-gray-800/50">
            <CardHeader>
              <CardTitle>Payment Notifications {isFetching && '(Loading...)'}</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentData.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {paymentData.map((payment, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedPayment === payment ? 'bg-blue-900/70' : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate">
                          {payment.payment_id ? 
                            `ID: ${typeof payment.payment_id === 'string' ? payment.payment_id.substring(0, 8) : payment.payment_id}...` 
                            : 'Unknown Payment'}
                        </div>
                        {payment.payment_status && (
                          <Badge className={getStatusColor(payment.payment_status)}>
                            {payment.payment_status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTimestamp(payment.timestamp || payment.createdAt)}
                      </div>
                      {payment.price_amount && payment.price_currency && (
                        <div className="text-sm mt-1">
                          Amount: {payment.price_amount} {payment.price_currency}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  {isFetching ? 'Loading payment data...' : 'No payment notifications yet'}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-4 text-sm">
            <div className="font-medium mb-2">Payment statuses:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <Badge className="bg-yellow-500 mr-2">waiting</Badge>
                <span className="text-xs">Payment created</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-blue-500 mr-2">confirming</Badge>
                <span className="text-xs">Pending confirmation</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-green-500 mr-2">confirmed</Badge>
                <span className="text-xs">Payment confirmed</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-green-700 mr-2">finished</Badge>
                <span className="text-xs">Payment complete</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selected payment details */}
        <div className="md:col-span-2">
          <Card className="bg-gray-800/50">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPayment ? (
                <div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Payment ID</div>
                      <div>{selectedPayment.payment_id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div>
                        <Badge className={getStatusColor(selectedPayment.payment_status || 'unknown')}>
                          {selectedPayment.payment_status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Amount</div>
                      <div>
                        {selectedPayment.price_amount} {selectedPayment.price_currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">User ID</div>
                      <div>{selectedPayment.userId || selectedPayment.order_id || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Created At</div>
                      <div>{formatTimestamp(selectedPayment.timestamp || selectedPayment.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Pay Address</div>
                      <div className="truncate">{selectedPayment.pay_address || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mt-4 mb-2">Raw Payment Data</h3>
                  <pre className="bg-gray-900/50 p-3 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(selectedPayment.paymentData || selectedPayment, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Select a payment to view details
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment logs */}
          <Card className="bg-gray-800/50 mt-6">
            <CardHeader>
              <CardTitle>Payment Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-300">{log}</div>
                ))}
                {logs.length === 0 && !isFetching && (
                  <div className="text-sm text-gray-500">No payment logs yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};