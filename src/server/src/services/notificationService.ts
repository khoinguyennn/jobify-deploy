import { NotificationRepository } from '@/repositories/notificationRepository';
import { Notification, CreateNotificationDTO, NotificationQueryParams } from '@/types/notification';
import { sendNotificationToUser, sendNotificationToCompany } from '@/config/socket';

export class NotificationService {
  
  /**
   * Tạo notification mới và gửi real-time
   */
  static async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    // Tạo notification trong database
    const notification = await NotificationRepository.create(data);
    
    // Gửi real-time notification
    if (data.idUser) {
      sendNotificationToUser(data.idUser, notification);
    } else if (data.idCompany) {
      sendNotificationToCompany(data.idCompany, notification);
    }
    
    return notification;
  }

  /**
   * Lấy notifications của user với pagination
   */
  static async getUserNotifications(
    userId: number, 
    params: NotificationQueryParams = {}
  ): Promise<{ 
    notifications: Notification[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
    unreadCount: number;
  }> {
    const { page = 1, limit = 20 } = params;
    
    const { notifications, total } = await NotificationRepository.findByUser(userId, params);
    const unreadCount = await NotificationRepository.countUnread(userId);
    
    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount
    };
  }

  /**
   * Lấy notifications của company với pagination
   */
  static async getCompanyNotifications(
    companyId: number, 
    params: NotificationQueryParams = {}
  ): Promise<{ 
    notifications: Notification[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
    unreadCount: number;
  }> {
    const { page = 1, limit = 20 } = params;
    
    const { notifications, total } = await NotificationRepository.findByCompany(companyId, params);
    const unreadCount = await NotificationRepository.countUnread(undefined, companyId);
    
    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount
    };
  }

  /**
   * Đánh dấu notification đã đọc
   */
  static async markAsRead(
    notificationId: number, 
    userId?: number, 
    companyId?: number
  ): Promise<void> {
    await NotificationRepository.markAsRead(notificationId, userId, companyId);
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  static async markAllAsRead(userId?: number, companyId?: number): Promise<void> {
    await NotificationRepository.markAllAsRead(userId, companyId);
  }

  /**
   * Xóa notification
   */
  static async deleteNotification(
    notificationId: number, 
    userId?: number, 
    companyId?: number
  ): Promise<void> {
    await NotificationRepository.delete(notificationId, userId, companyId);
  }

  /**
   * Lấy số notification chưa đọc
   */
  static async getUnreadCount(userId?: number, companyId?: number): Promise<number> {
    return await NotificationRepository.countUnread(userId, companyId);
  }

  // === Helper methods để tạo các loại notification cụ thể ===

  /**
   * Thông báo khi có ứng viên apply job (cho company)
   */
  static async notifyJobApplication(
    companyId: number, 
    jobTitle: string, 
    applicantName: string
  ): Promise<Notification> {
    return await this.createNotification({
      idCompany: companyId,
      title: 'Ứng tuyển mới',
      content: `${applicantName} đã ứng tuyển vào vị trí "${jobTitle}"`,
      type: 'job_application'
    });
  }

  /**
   * Thông báo khi trạng thái ứng tuyển thay đổi (cho user)
   */
  static async notifyApplicationStatusUpdate(
    userId: number, 
    jobTitle: string, 
    status: string,
    companyName: string
  ): Promise<Notification> {
    let title = 'Cập nhật trạng thái ứng tuyển';
    let content = '';
    let type: 'success' | 'info' | 'warning' = 'info';
    
    switch (status) {
      case 'accepted':
        title = 'Chúc mừng! Hồ sơ được chấp nhận';
        content = `Hồ sơ ứng tuyển "${jobTitle}" tại ${companyName} đã được chấp nhận`;
        type = 'success';
        break;
      case 'rejected':
        title = 'Thông báo từ nhà tuyển dụng';
        content = `Hồ sơ ứng tuyển "${jobTitle}" tại ${companyName} chưa phù hợp lần này`;
        type = 'warning';
        break;
      case 'under_review':
        title = 'Hồ sơ đang được xem xét';
        content = `${companyName} đang xem xét hồ sơ ứng tuyển "${jobTitle}" của bạn`;
        type = 'info';
        break;
      default:
        content = `Trạng thái ứng tuyển "${jobTitle}" tại ${companyName} đã được cập nhật`;
    }
    
    return await this.createNotification({
      idUser: userId,
      title,
      content,
      type
    });
  }

  /**
   * Thông báo về việc làm phù hợp (cho user)
   */
  static async notifyNewJobMatch(
    userId: number, 
    jobTitle: string, 
    companyName: string
  ): Promise<Notification> {
    return await this.createNotification({
      idUser: userId,
      title: 'Việc làm phù hợp',
      content: `Có việc làm mới phù hợp: "${jobTitle}" tại ${companyName}`,
      type: 'new_job_match'
    });
  }
}
































