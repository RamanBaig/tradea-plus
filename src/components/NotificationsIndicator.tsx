import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { InboxIcon } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead } from '../services/firebase';
import { getUserMetadata, saveSupportMessageToMetadata } from '../services/userMetadata';

export const NotificationsIndicator = () => {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Array<{
    messageId: string; 
    originalMessage: string;
    reply: { id: string; message: string; createdAt: string; isAdmin: boolean; read?: boolean };
  }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        // Get unread notifications from Firebase
        const unread = await getUnreadNotifications(user.id);
        
        // Get stored messages from Clerk metadata
        const metadata = await getUserMetadata(user);
        const storedMessages = metadata.supportMessages || [];

        // Combine Firebase notifications with stored messages
        const allNotifications = unread.map(n => ({
          messageId: n.messageId,
          originalMessage: storedMessages.find(m => m.messageId === n.messageId)?.originalMessage || 'Message not found',
          reply: n.reply
        }));

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (messageId: string, replyId: string, originalMessage: string) => {
    if (!user) return;

    try {
      // Mark as read in Firebase
      await markNotificationAsRead(messageId, replyId);
      
      // Save to Clerk metadata
      const replyToSave = notifications
        .find(n => n.messageId === messageId)
        ?.reply;
        
      if (replyToSave) {
        await saveSupportMessageToMetadata(
          user,
          messageId,
          originalMessage,
          replyToSave
        );
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.reply.id !== replyId));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 
          rounded-lg transition-all duration-300"
      >
        <InboxIcon className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] 
            flex items-center justify-center text-white font-medium
            animate-[pulse_2s_infinite]">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-y-auto
          bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-xl
          animate-[fadeIn_0.2s_ease-out,slideDown_0.2s_ease-out]"
        >
          {notifications.length > 0 ? (
            <div className="p-4 space-y-3">
              {notifications.map(({ messageId, reply, originalMessage }) => (
                <div key={reply.id} 
                  className="p-3 bg-gray-700/30 rounded-lg 
                    animate-[slideUp_0.2s_ease-out,fadeIn_0.2s_ease-out]"
                >
                  <div className="text-xs text-gray-400 mb-2">
                    Re: {originalMessage}
                  </div>
                  <p className="text-sm text-gray-300">{reply.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleMarkAsRead(messageId, reply.id, originalMessage)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Resolve Conversation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="relative">
                  <InboxIcon className="w-12 h-12 text-gray-600" />
                  <div className="absolute inset-0 animate-ping bg-gray-600/20 rounded-full" />
                </div>
                <div className="absolute -inset-4 animate-[spin_3s_linear_infinite] opacity-0">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-600/0 via-gray-600/10 to-gray-600/0" />
                </div>
              </div>
              <p className="text-gray-400 font-medium mb-1">No new messages</p>
              <p className="text-sm text-gray-500">
                Admin replies will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};