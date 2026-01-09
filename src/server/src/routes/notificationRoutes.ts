import { Router } from 'express';
import { NotificationController } from '@/controllers/notificationController';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         idUser:
 *           type: integer
 *           nullable: true
 *         idCompany:
 *           type: integer
 *           nullable: true
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [info, success, warning, error, job_application, job_status_update, new_job_match]
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API quản lý thông báo
 */

// GET /api/notifications - Lấy danh sách thông báo
router.get('/', NotificationController.getNotifications);

// GET /api/notifications/unread-count - Lấy số thông báo chưa đọc
router.get('/unread-count', NotificationController.getUnreadCount);

// PUT /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
router.put('/mark-all-read', NotificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Đánh dấu thông báo đã đọc
router.put('/:id/read', NotificationController.markAsRead);

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', NotificationController.deleteNotification);

// POST /api/notifications/test - Tạo thông báo test (development only)
router.post('/test', NotificationController.createTestNotification);

export default router;
































