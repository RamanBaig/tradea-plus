import { useState, useEffect } from 'react';
import { Trash2, Loader2, Mail, RotateCw } from 'lucide-react';
import { getSupportMessages, deleteSupportMessage, type SupportMessage } from '../../services/firebase';

export const SupportMessagesPage = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingMap, setIsDeletingMap] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMessages = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const fetchedMessages = await getSupportMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleRefresh = () => {
    loadMessages(true);
  };

  const handleDelete = async (messageId: string) => {
    setIsDeletingMap(prev => ({ ...prev, [messageId]: true }));
    try {
      await deleteSupportMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeletingMap(prev => ({ ...prev, [messageId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 px-8 pb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-8 pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Support Messages</h1>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 
              rounded transition-colors disabled:opacity-50"
            title="Refresh messages"
          >
            <RotateCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 glass-panel">
              <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No support messages yet</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id}
                className="glass-panel p-6 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-medium text-blue-400">{message.userEmail}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-300 whitespace-pre-wrap mt-3">{message.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(message.id)}
                    disabled={isDeletingMap[message.id]}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 
                      rounded transition-colors disabled:opacity-50"
                  >
                    {isDeletingMap[message.id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};