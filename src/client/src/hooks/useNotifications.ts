import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useState } from 'react';

// Types
export interface Notification {
  id: number;
  idUser?: number;
  idCompany?: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job_application' | 'job_status_update' | 'new_job_match';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

/**
 * Hook để lấy danh sách thông báo
 */
export const useNotifications = (params: NotificationQueryParams = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async (): Promise<NotificationResponse> => {
      const queryString = new URLSearchParams();
      
      if (params.page) queryString.append('page', params.page.toString());
      if (params.limit) queryString.append('limit', params.limit.toString());
      if (params.isRead !== undefined) queryString.append('isRead', params.isRead.toString());
      
      const url = `/notifications${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook để lấy số thông báo chưa đọc
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.data.unreadCount;
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook để đánh dấu thông báo đã đọc
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await apiClient.put(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      // Invalidate và refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu đã đọc';
      showToast.error(message);
    },
  });
};

/**
 * Hook để đánh dấu tất cả thông báo đã đọc
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu tất cả đã đọc';
      showToast.error(message);
    },
  });
};

/**
 * Hook để xóa thông báo
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await apiClient.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('Đã xóa thông báo');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa thông báo';
      showToast.error(message);
    },
  });
};

/**
 * Hook để tạo thông báo test (development only)
 */
export const useCreateTestNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title?: string; content?: string; type?: string }) => {
      await apiClient.post('/notifications/test', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast.success('Đã tạo thông báo test');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thông báo test';
      showToast.error(message);
    },
  });
};

/**
 * Hook để lắng nghe thông báo real-time
 */
export const useRealtimeNotifications = () => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Cập nhật state
      setLatestNotification(notification);
      
      // Invalidate queries để refetch data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Hiện toast notification
      const notificationTypeMap = {
        'success': () => showToast.success(notification.title),
        'error': () => showToast.error(notification.title),
        'warning': () => showToast.warning(notification.title),
        'info': () => showToast.info(notification.title),
        'job_application': () => showToast.info(notification.title),
        'job_status_update': () => showToast.info(notification.title),
        'new_job_match': () => showToast.info(notification.title),
      };
      
      const showNotification = notificationTypeMap[notification.type];
      if (showNotification) {
        showNotification();
      } else {
        showToast.info(notification.title);
      }
    };

    socket.on('new_notification', handleNewNotification);

    // Cleanup function
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isConnected, queryClient]);

  return {
    latestNotification,
    clearLatestNotification: () => setLatestNotification(null),
  };
};