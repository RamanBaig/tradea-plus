import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  enableIndexedDbPersistence, 
  serverTimestamp,
  where,
  doc,
  setDoc,
  increment,
  Timestamp,
  deleteDoc,
  arrayUnion,
  getDoc,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2HX447XAztbxY7VtOFA6GVJ4_m-C3aT8",
  authDomain: "tradeay.firebaseapp.com",
  projectId: "tradeay",
  storageBucket: "tradeay.firebasestorage.app",
  messagingSenderId: "479482587116",
  appId: "1:479482587116:web:eb49d90be8ffbdc28102c9",
  measurementId: "G-C7YG0QK2PG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with production settings
const db = getFirestore(app);

// Enable persistence (offline support)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence');
  }
});

// Test connection
getDocs(collection(db, "payment_logs"))
  .then(() => console.log('✅ Firestore connected'))
  .catch(err => console.error('❌ Firestore connection error:', err));

// Type definition for payment logs
export interface PaymentLog {
  id?: string;
  message?: string;
  timestamp?: any; // Firebase timestamp
  createdAt?: string;
  userId?: string;
  email?: string;
  payment_id?: string;
  payment_status?: string;
  price_amount?: number | string;
  price_currency?: string;
  order_id?: string;
  pay_address?: string;
  paymentData?: any;
  [key: string]: any; // Allow for additional fields
}

export async function addPaymentLog(message: string, userId?: string, email?: string, paymentData?: any) {
  try {
    // Create a document with required fields, avoiding undefined values
    const logData: Record<string, any> = {
      message,
      timestamp: serverTimestamp(), // Use server timestamp
      createdAt: new Date().toISOString()
    };
    
    // Only add fields if they have values
    if (userId) logData.userId = userId;
    if (email) logData.email = email;
    if (paymentData) {
      // Extract key payment information for better logs
      if (paymentData.payment_id) logData.payment_id = paymentData.payment_id;
      if (paymentData.payment_status) logData.payment_status = paymentData.payment_status;
      if (paymentData.order_id) logData.order_id = paymentData.order_id;
      if (paymentData.price_amount) logData.price_amount = paymentData.price_amount;
      if (paymentData.price_currency) logData.price_currency = paymentData.price_currency;
      if (paymentData.pay_address) logData.pay_address = paymentData.pay_address;
      
      // Store the full payment data in a nested field
      logData.paymentData = paymentData;
    }
    
    const docRef = await addDoc(collection(db, "payment_logs"), logData);
    console.log("Payment log added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment log:", error);
    throw error; // Propagate error for handling
  }
}

export async function getPaymentLogs() {
  const logs: string[] = [];
  try {
    const q = query(collection(db, "payment_logs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Handle both server timestamp and regular date
      const timestamp = data.timestamp?.toDate?.() || new Date(data.createdAt);
      
      // Format log with more detailed information
      let logEntry = `${timestamp.toLocaleString()}: ${data.message}`;
      
      // Add payment details if available
      if (data.payment_id) logEntry += ` | ID: ${data.payment_id}`;
      if (data.payment_status) logEntry += ` | Status: ${data.payment_status}`;
      if (data.price_amount && data.price_currency) {
        logEntry += ` | Amount: ${data.price_amount} ${data.price_currency}`;
      }
      if (data.userId) logEntry += ` | User: ${data.userId}`;
      
      logs.push(logEntry);
    });
    return logs;
  } catch (error) {
    console.error("Error getting payment logs:", error);
    return [`Error loading payment logs: ${error instanceof Error ? error.message : 'Unknown error'}`];
  }
}

export async function getAllPaymentData(): Promise<PaymentLog[]> {
  try {
    const payments: PaymentLog[] = [];
    
    // Modified query to avoid the index error
    // Using just orderBy without the where clause that requires a composite index
    const q = query(
      collection(db, "payment_logs"), 
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filter in memory instead of in the query
    querySnapshot.forEach((doc) => {
      const data = doc.data() as PaymentLog;
      // Only include documents that have payment_id
      if (data.payment_id) {
        payments.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return payments;
  } catch (error) {
    console.error("Error getting payment data:", error);
    return [];
  }
}

// API Key tracking functions
function getEstTime(date: Date = new Date()): Date {
  // Get the timezone offset in minutes for EST (UTC-4 for EDT, UTC-5 for EST)
  const estTimezoneOffset = -4 * 60; // Using EDT for now
  const localOffset = date.getTimezoneOffset();
  const offsetDiff = (localOffset - estTimezoneOffset) * 60 * 1000;
  return new Date(date.getTime() - offsetDiff);
}

export async function trackApiKeyUsage(keyId: string, keyName: string) {
  const estDate = getEstTime();
  estDate.setHours(0, 0, 0, 0);
  
  const docId = `${keyId}_${estDate.toISOString().split('T')[0]}`;
  
  try {
    await setDoc(doc(db, "api_key_usage", docId), {
      keyId,
      keyName,
      usageCount: increment(1),
      lastUsed: serverTimestamp(),
      date: Timestamp.fromDate(estDate)
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error tracking API key usage:", error);
    return false;
  }
}

export async function getApiKeyUsageStats() {
  try {
    const estDate = getEstTime();
    estDate.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "api_key_usage"),
      where("date", ">=", Timestamp.fromDate(estDate)),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(q);
    const stats: Record<string, { used: number; name: string }> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats[data.keyId] = {
        used: data.usageCount || 0,
        name: data.keyName
      };
    });

    return stats;
  } catch (error) {
    console.error("Error getting API key usage stats:", error);
    return {};
  }
}

// Function to clean up old API key usage data
export async function cleanupOldApiKeyUsage() {
  try {
    const estDate = getEstTime();
    const yesterday = new Date(estDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "api_key_usage"),
      where("date", "<=", Timestamp.fromDate(yesterday))
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Successfully cleaned up old API key usage data");
    return true;
  } catch (error) {
    console.error("Error cleaning up API key usage:", error);
    return false;
  }
}

// Support message functions
export interface SupportMessage {
  id: string;
  userId: string;
  userEmail: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved';
  replies?: Array<{
    id: string;
    message: string;
    createdAt: string;
    isAdmin: boolean;
    read?: boolean;
  }>;
}

interface FirebaseSupportMessage {
  id: string;
  userId: string;
  email: string;
  description: string;
  timestamp: any; // Firebase Timestamp
  createdAt: string;
  status: 'pending' | 'resolved';
  replies?: Array<{
    id: string;
    message: string;
    createdAt: string;
    isAdmin: boolean;
    read?: boolean;
  }>;
}

export async function addSupportMessage(message: { 
  userId: string;
  email: string;
  description: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "support_messages"), {
      ...message,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    console.log("Support message added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding support message:", error);
    throw error;
  }
}

export async function getSupportMessages(): Promise<SupportMessage[]> {
  try {
    const q = query(collection(db, "support_messages"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as Omit<FirebaseSupportMessage, 'id'>;
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.email,
        description: data.description,
        createdAt: data.createdAt,
        status: data.status || 'pending',
        replies: data.replies || []
      };
    });
  } catch (error) {
    console.error("Error getting support messages:", error);
    throw error;
  }
}

export async function deleteSupportMessage(messageId: string) {
  try {
    await deleteDoc(doc(db, "support_messages", messageId));
    console.log("Support message deleted:", messageId);
  } catch (error) {
    console.error("Error deleting support message:", error);
    throw error;
  }
}

// Add a reply to a support message
export async function addSupportMessageReply(messageId: string, reply: { message: string; isAdmin: boolean }) {
  try {
    const messageRef = doc(db, "support_messages", messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const replyData = {
      id: crypto.randomUUID(),
      message: reply.message,
      createdAt: new Date().toISOString(),
      isAdmin: reply.isAdmin,
      read: false
    };

    await setDoc(messageRef, {
      replies: arrayUnion(replyData),
      status: reply.isAdmin ? 'resolved' : 'pending',
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // Return both the reply data and original message
    return {
      ...replyData,
      originalMessage: messageDoc.data().description
    };
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
}

// Get unread notifications for a user
export async function getUnreadNotifications(userId: string): Promise<Array<{messageId: string; reply: NonNullable<SupportMessage['replies']>[number]}>> {
  try {
    // Query only by userId first
    const q = query(
      collection(db, "support_messages"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Array<{messageId: string; reply: NonNullable<SupportMessage['replies']>[number]}> = [];
    
    querySnapshot.forEach(doc => {
      const data = doc.data() as FirebaseSupportMessage;
      // Filter replies in memory instead of using where clause
      if (data.replies && data.replies.length > 0) {
        const unreadReplies = data.replies.filter(reply => reply.isAdmin && !reply.read);
        unreadReplies.forEach(reply => {
          notifications.push({
            messageId: doc.id,
            reply
          });
        });
      }
    });
    
    return notifications;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(messageId: string, replyId: string) {
  try {
    const messageRef = doc(db, "support_messages", messageId);
    const message = (await getDoc(messageRef)).data() as FirebaseSupportMessage;
    
    const updatedReplies = message.replies?.map(reply => {
      if (reply.id === replyId) {
        return { ...reply, read: true };
      }
      return reply;
    });
    
    await setDoc(messageRef, { replies: updatedReplies }, { merge: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}
