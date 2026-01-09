import { Request, Response } from 'express';
import { NotificationService } from '@/services/notificationService';
import { ResponseUtil } from '@/utils/response';
import { catchAsync } from '@/middlewares/errorHandler';
import { AuthenticatedRequest } from '@/types';

export class NotificationController {
  
  /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: Lấy danh sách thông báo
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - in: query
   *         name: isRead
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Danh sách thông báo thành công
   */
  static getNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userId, userType } = req.user!;
    const { page, limit, isRead } = req.query;
    
    const params = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      isRead: isRead !== undefined ? isRead === 'true' : undefined
    };
    
    let result;
    
    if (userType === 'user') {
      result = await NotificationService.getUserNotifications(userId, params);
    } else {
      result = await NotificationService.getCompanyNotifications(userId, params);
    }
    
    ResponseUtil.success(res, result, 'Lấy danh sách thông báo thành công');
  });

  /**
   * @swagger
   * /notifications/unread-count:
   *   get:
   *     summary: Lấy số thông báo chưa đọc
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Số thông báo chưa đọc
   */
  static getUnreadCount = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userId, userType } = req.user!;
    
    const unreadCount = userType === 'user' 
      ? await NotificationService.getUnreadCount(userId) 
      : await NotificationService.getUnreadCount(undefined, userId);
    
    ResponseUtil.success(res, { unreadCount }, 'Lấy số thông báo chưa đọc thành công');
  });

  /**
   * @swagger
   * /notifications/{id}/read:
   *   put:
   *     summary: Đánh dấu thông báo đã đọc
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Đánh dấu đã đọc thành công
   */
  static markAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userId, userType } = req.user!;
    const notificationId = parseInt(req.params.id);
    
    if (userType === 'user') {
      await NotificationService.markAsRead(notificationId, userId);
    } else {
      await NotificationService.markAsRead(notificationId, undefined, userId);
    }
    
    ResponseUtil.success(res, null, 'Đánh dấu thông báo đã đọc thành công');
  });

  /**
   * @swagger
   * /notifications/mark-all-read:
   *   put:
   *     summary: Đánh dấu tất cả thông báo đã đọc
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Đánh dấu tất cả đã đọc thành công
   */
  static markAllAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userId, userType } = req.user!;
    
    if (userType === 'user') {
      await NotificationService.markAllAsRead(userId);
    } else {
      await NotificationService.markAllAsRead(undefined, userId);
    }
    
    ResponseUtil.success(res, null, 'Đánh dấu tất cả thông báo đã đọc thành công');
  });

  /**
   * @swagger
   * /notifications/{id}:
   *   delete:
   *     summary: Xóa thông báo
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Xóa thông báo thành công
   */
  static deleteNotification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userId, userType } = req.user!;
    const notificationId = parseInt(req.params.id);
    
    if (userType === 'user') {
      await NotificationService.deleteNotification(notificationId, userId);
    } else {
      await NotificationService.deleteNotification(notificationId, undefined, userId);
    }
    
    ResponseUtil.success(res, null, 'Xóa thông báo thành công');
  });

  /**
   * @swagger
   * /notifications/test:
   *   post:
   *     summary: Tạo thông báo test (development only)
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [info, success, warning, error]
   *     responses:
   *       200:
   *         description: Tạo thông báo test thành công
   */
  static createTestNotification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    // Chỉ cho phép trong môi trường development
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtil.error(res, 'Tính năng này chỉ khả dụng trong môi trường development', 403);
    }
    
    const { id: userId, userType } = req.user!;
    const { title, content, type = 'info' } = req.body;
    
    const notification = await NotificationService.createNotification({
      idUser: userType === 'user' ? userId : undefined,
      idCompany: userType === 'company' ? userId : undefined,
      title: title || 'Thông báo test',
      content: content || 'Đây là thông báo test từ hệ thống',
      type
    });
    
    ResponseUtil.success(res, notification, 'Tạo thông báo test thành công');
  });
}
