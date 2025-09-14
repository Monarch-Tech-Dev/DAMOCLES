// Sacred Architecture Notification Hook ⚔️
// Real-time notifications for the DAMOCLES platform

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  priority: NotificationPriority;
}

enum NotificationType {
  DEBT_ANALYSIS_COMPLETE = 'debt_analysis_complete',
  GDPR_REQUEST_SENT = 'gdpr_request_sent',
  GDPR_RESPONSE_RECEIVED = 'gdpr_response_received',
  VIOLATION_DETECTED = 'violation_detected',
  SETTLEMENT_OPPORTUNITY = 'settlement_opportunity',
  TOKENS_EARNED = 'tokens_earned',
  COLLECTIVE_ACTION_AVAILABLE = 'collective_action_available',
  DOCUMENT_PROCESSED = 'document_processed',
  SYSTEM_UPDATE = 'system_update',
  KINDNESS_MILESTONE = 'kindness_milestone'
}

enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  kindnessScore: number;
  markAsRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string;
  token: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId, 
  token 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [kindnessScore, setKindnessScore] = useState(0);

  useEffect(() => {
    // Initialize WebSocket connection
    const socketUrl = process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:8003';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('⚔️ Connected to Sacred Architecture notifications');
      setIsConnected(true);
      
      // Authenticate the socket
      newSocket.emit('authenticate', { userId, token });
    });

    newSocket.on('authenticated', (data) => {
      console.log('✨ Authenticated with Sacred Architecture');
      setKindnessScore(data.kindnessScore);
      
      // Show welcome notification
      toast.success('Connected to real-time notifications', {
        icon: '⚔️',
        duration: 3000
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notifications');
      setIsConnected(false);
    });

    // Handle incoming notifications
    newSocket.on('notification:new', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast based on priority
      showNotificationToast(notification);
      
      // Play notification sound for high priority
      if (notification.priority === NotificationPriority.HIGH || 
          notification.priority === NotificationPriority.URGENT) {
        playNotificationSound();
      }
    });

    // Handle queued notifications
    newSocket.on('notifications:queued', (queued: Notification[]) => {
      console.log(`📦 Received ${queued.length} queued notifications`);
      setNotifications(prev => [...queued, ...prev]);
      setUnreadCount(queued.filter(n => !n.read).length);
    });

    // Handle system notifications
    newSocket.on('notification:system', (notification) => {
      console.log('📢 System notification:', notification);
      showSystemNotification(notification);
    });

    // Handle errors
    newSocket.on('error', (error) => {
      console.error('Notification error:', error);
      toast.error('Notification connection error');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [userId, token]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (socket) {
      socket.emit('notification:read', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId: string) => {
    if (socket) {
      socket.emit('notification:dismiss', notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if dismissed notification was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [socket, notifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications cleared');
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    kindnessScore,
    markAsRead,
    dismissNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper function to show notification toast
function showNotificationToast(notification: Notification) {
  const icons: Record<NotificationType, string> = {
    [NotificationType.DEBT_ANALYSIS_COMPLETE]: '📊',
    [NotificationType.GDPR_REQUEST_SENT]: '📤',
    [NotificationType.GDPR_RESPONSE_RECEIVED]: '📥',
    [NotificationType.VIOLATION_DETECTED]: '🚨',
    [NotificationType.SETTLEMENT_OPPORTUNITY]: '🤝',
    [NotificationType.TOKENS_EARNED]: '💎',
    [NotificationType.COLLECTIVE_ACTION_AVAILABLE]: '👥',
    [NotificationType.DOCUMENT_PROCESSED]: '📄',
    [NotificationType.SYSTEM_UPDATE]: '🔄',
    [NotificationType.KINDNESS_MILESTONE]: '🌟'
  };

  const toastOptions = {
    icon: icons[notification.type] || '📬',
    duration: notification.priority === NotificationPriority.URGENT ? 10000 : 5000,
    style: {
      background: notification.priority === NotificationPriority.URGENT ? '#ef4444' : 
                  notification.priority === NotificationPriority.HIGH ? '#f97316' : 
                  '#667eea',
      color: 'white',
    }
  };

  toast(notification.message, toastOptions);
}

// Helper function to show system notification
function showSystemNotification(notification: any) {
  toast(notification.message, {
    icon: '📢',
    duration: 6000,
    style: {
      background: '#667eea',
      color: 'white',
    }
  });
}

// Helper function to play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  } catch (error) {
    console.log('Notification sound not available');
  }
}

// Notification Bell Component
export const NotificationBell: React.FC = () => {
  const { unreadCount, notifications, markAsRead, dismissNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>⚔️</span> Notifications
            </h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No notifications yet</p>
              <p className="text-sm mt-2">Sacred Architecture is watching over you</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toRelativeTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          aria-label="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                        aria-label="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="p-3 border-t border-gray-200 text-center">
            <a href="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Export types
export type { Notification, NotificationType, NotificationPriority };