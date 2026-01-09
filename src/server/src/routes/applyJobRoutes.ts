import { Router } from 'express';
import { ApplyJobController } from '@/controllers/applyJobController';
import { authenticate, authorize } from '@/middlewares/auth';
import { uploadCV } from '@/middlewares/upload';

const router = Router();
const applyJobController = new ApplyJobController();

// ===== APPLY JOB ROUTES =====
// Prefix: /api/apply

/**
 * Apply Job Routes - Ứng tuyển công việc
 * 
 * User Routes (Ứng viên):
 * GET /apply - Danh sách ứng tuyển của user (đơn giản)
 * POST /apply - Ứng tuyển công việc
 * DELETE /apply/:idJob - Hủy ứng tuyển  
 * GET /apply/status/:idJob - Kiểm tra trạng thái ứng tuyển
 * 
 * Company Routes (Nhà tuyển dụng):
 * GET /apply/company - Danh sách ứng tuyển của công ty
 * PUT /apply/:id/status - Cập nhật trạng thái ứng tuyển
 * PUT /apply/hidden - Ẩn đơn ứng tuyển
 * PUT /apply/unHidden - Hủy ẩn đơn ứng tuyển
 * GET /apply/userHideApply - Danh sách đơn ứng tuyển đã ẩn
 * 
 * Shared Routes:
 * GET /apply/:id - Chi tiết ứng tuyển (User hoặc Company)
 */

// ===== USER ROUTES (Ứng viên) =====

/**
 * GET /apply - Lấy danh sách ứng tuyển của user (đơn giản)
 * Cho phép ứng viên xem danh sách các đơn ứng tuyển của mình với pagination cơ bản
 * @access Private (User only)
 */
router.get('/', authenticate, authorize('user'), applyJobController.getUserApplicationsSimple);

/**
 * POST /apply - Ứng tuyển công việc
 * Cho phép ứng viên ứng tuyển vào một công việc
 * @access Private (User only)
 */
router.post('/', authenticate, authorize('user'), uploadCV, applyJobController.applyForJob);

/**
 * DELETE /apply/:idJob - Hủy ứng tuyển
 * Cho phép ứng viên hủy đơn ứng tuyển của mình
 * @access Private (User only)
 */
router.delete('/:idJob', authenticate, authorize('user'), applyJobController.cancelApplication);


/**
 * GET /apply/status/:idJob - Kiểm tra trạng thái ứng tuyển
 * Kiểm tra xem user đã ứng tuyển vào job này chưa
 * @access Private (User only)
 */
router.get('/status/:idJob', authenticate, authorize('user'), applyJobController.checkApplicationStatus);

// ===== COMPANY ROUTES (Nhà tuyển dụng) =====

/**
 * GET /apply/company - Lấy danh sách ứng tuyển của công ty
 * Cho phép nhà tuyển dụng xem danh sách ứng tuyển với khả năng lọc và tìm kiếm
 * @access Private (Company only)
 */
router.get('/company', authenticate, authorize('company'), applyJobController.getCompanyApplications);

/**
 * PUT /apply/:id/status - Cập nhật trạng thái ứng tuyển
 * Cho phép nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
 * @access Private (Company only)
 */
router.put('/:id/status', authenticate, authorize('company'), applyJobController.updateApplicationStatus);


/**
 * PUT /apply/hidden - Ẩn đơn ứng tuyển
 * Cho phép nhà tuyển dụng ẩn đơn ứng tuyển (soft delete)
 * @access Private (Company only)
 */
router.put('/hidden', authenticate, authorize('company'), applyJobController.hideApplication);

/**
 * PUT /apply/unHidden - Hủy ẩn đơn ứng tuyển
 * Cho phép nhà tuyển dụng hủy ẩn đơn ứng tuyển (restore)
 * @access Private (Company only)
 */
router.put('/unHidden', authenticate, authorize('company'), applyJobController.unhideApplication);

/**
 * GET /apply/userHideApply - Lấy danh sách đơn ứng tuyển đã ẩn
 * Cho phép nhà tuyển dụng xem danh sách các đơn ứng tuyển đã ẩn
 * @access Private (Company only)
 */
router.get('/userHideApply', authenticate, authorize('company'), applyJobController.getHiddenApplications);

// ===== SHARED ROUTES (User hoặc Company) =====

/**
 * Middleware để cho phép cả user và company truy cập
 * Chỉ cần authenticate, không phân biệt userType vì business logic sẽ handle
 */

/**
 * GET /apply/:id - Lấy chi tiết ứng tuyển
 * Xem chi tiết một đơn ứng tuyển (chỉ dành cho nhà tuyển dụng)
 * @access Private (Company only)
 */
router.get('/:id', authenticate, authorize('company'), applyJobController.getApplicationDetail);

export default router;