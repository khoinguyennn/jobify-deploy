import { Request, Response, NextFunction } from 'express';
import { ApplyJobService } from '@/services/applyJobService';
import { ApplyJobQueryParams } from '@/repositories/applyJobRepository';
import { ApplyStatus, AuthenticatedRequest } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { catchAsync } from '@/middlewares/errorHandler';

/**
 * ApplyJobController - Xử lý HTTP requests cho ApplyJob
 */
export class ApplyJobController {
  private applyJobService: ApplyJobService;

  constructor() {
    this.applyJobService = new ApplyJobService();
  }

  /**
   * @swagger
   * /apply:
   *   post:
   *     tags: [Ứng tuyển]
   *     summary: Ứng tuyển công việc
   *     description: Cho phép ứng viên ứng tuyển vào một công việc
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - idJob
   *               - name
   *               - email
   *               - phone
   *             properties:
   *               idJob:
   *                 type: integer
   *                 description: ID của công việc cần ứng tuyển
   *                 example: 1
   *               name:
   *                 type: string
   *                 description: Họ tên ứng viên
   *                 example: Nguyễn Văn A
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email ứng viên
   *                 example: nguyenvana@gmail.com
   *               phone:
   *                 type: string
   *                 description: Số điện thoại ứng viên
   *                 example: "0123456789"
   *               letter:
   *                 type: string
   *                 description: Thư xin việc (không bắt buộc)
   *                 example: "Tôi rất quan tâm đến vị trí này..."
   *               cv:
   *                 type: string
   *                 format: uri
   *                 description: Link CV (không bắt buộc)
   *                 example: "https://example.com/cv.pdf"
   *     responses:
   *       201:
   *         description: Ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ApplyJob'
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Chưa đăng nhập
   *       409:
   *         description: Đã ứng tuyển công việc này rồi
   *       500:
   *         description: Lỗi server
   */
  applyForJob = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập để ứng tuyển', 401);
    }

    const { idJob, name, email, phone, letter } = req.body;
    const cvFile = req.file; // File được upload bởi multer

    if (!idJob) {
      return ResponseUtil.error(res, 'ID công việc là bắt buộc', 400);
    }

    const application = await this.applyJobService.applyForJob({
      idUser: userId,
      idJob: Number(idJob),
      name,
      email,
      phone,
      letter,
      cv: cvFile?.filename // Lấy filename từ multer
    });

    ResponseUtil.created(res, application, 'Ứng tuyển thành công');
  });

  /**
   * @swagger
   * /apply/{idJob}:
   *   delete:
   *     tags: [Ứng tuyển]
   *     summary: Hủy ứng tuyển
   *     description: Cho phép ứng viên hủy đơn ứng tuyển của mình
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: idJob
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của công việc cần hủy ứng tuyển
   *         example: 1
   *     responses:
   *       200:
   *         description: Hủy ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Chưa đăng nhập
   *       404:
   *         description: Không tìm thấy đơn ứng tuyển
   *       500:
   *         description: Lỗi server
   */
  cancelApplication = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { idJob } = req.params;
    if (!idJob) {
      return ResponseUtil.error(res, 'ID công việc là bắt buộc', 400);
    }

    await this.applyJobService.cancelApplication(userId, Number(idJob));

    ResponseUtil.success(res, null, 'Hủy ứng tuyển thành công');
  });

  /**
   * @swagger
   * /apply/{id}/status:
   *   put:
   *     tags: [Ứng tuyển]
   *     summary: Cập nhật trạng thái ứng tuyển
   *     description: Cho phép nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của đơn ứng tuyển
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: integer
   *                 enum: [1, 2, 3, 4, 5]
   *                 description: |
   *                   Trạng thái ứng tuyển:
   *                   - 1: Chưa xem
   *                   - 2: Đã xem
   *                   - 3: Phỏng vấn
   *                   - 4: Từ chối
   *                   - 5: Chấp nhận
   *                 example: 2
   *     responses:
   *       200:
   *         description: Cập nhật trạng thái thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ApplyJob'
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền cập nhật
   *       404:
   *         description: Không tìm thấy đơn ứng tuyển
   *       500:
   *         description: Lỗi server
   */
  updateApplicationStatus = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // authorize('company') middleware đã kiểm tra, req.user.userType === 'company'
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Không xác định được ID công ty', 400);
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || status === undefined) {
      return ResponseUtil.error(res, 'ID ứng tuyển và trạng thái là bắt buộc', 400);
    }

    // Validate trạng thái
    const validStatuses = [1, 2, 3, 4, 5];
    if (!validStatuses.includes(Number(status))) {
      return ResponseUtil.error(res, 'Trạng thái không hợp lệ. Trạng thái phải là: 1 (Chưa xem), 2 (Đã xem), 3 (Phỏng vấn), 4 (Từ chối), 5 (Chấp nhận)', 400);
    }

    const updatedApplication = await this.applyJobService.updateApplicationStatus(
      Number(id),
      Number(status) as ApplyStatus,
      companyId
    );

    ResponseUtil.success(res, updatedApplication, 'Cập nhật trạng thái thành công');
  });

  /**
   * @swagger
   * /apply/company:
   *   get:
   *     tags: [Ứng tuyển]
   *     summary: Lấy danh sách ứng tuyển của công ty
   *     description: Cho phép nhà tuyển dụng xem danh sách ứng tuyển với khả năng lọc và tìm kiếm
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Số trang (mặc định 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Số lượng bản ghi mỗi trang (mặc định 10)
   *       - in: query
   *         name: idJob
   *         schema:
   *           type: integer
   *         description: Lọc theo ID công việc
   *       - in: query
   *         name: status
   *         schema:
   *           type: integer
   *           enum: [1, 2, 3, 4, 5]
   *         description: |
   *           Lọc theo trạng thái ứng tuyển:
   *           - 1: Chưa xem
   *           - 2: Đã xem
   *           - 3: Phỏng vấn
   *           - 4: Từ chối
   *           - 5: Chấp nhận
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Tìm kiếm theo tên ứng viên, email hoặc tên công việc
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *           enum: [newest, oldest, status]
   *           default: newest
   *         description: Sắp xếp kết quả
   *     responses:
   *       200:
   *         description: Lấy danh sách ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - $ref: '#/components/schemas/PaginatedResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         data:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ApplyJobWithDetails'
   *       401:
   *         description: Chưa đăng nhập hoặc không có quyền
   *       500:
   *         description: Lỗi server
   */
  getCompanyApplications = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // authorize('company') middleware đã kiểm tra, req.user.userType === 'company'
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Không xác định được ID công ty', 400);
    }

    const { page, limit, idJob, status, search, sort } = req.query;

    const params: ApplyJobQueryParams = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      idJob: idJob ? Number(idJob) : undefined,
      status: status ? Number(status) : undefined,
      search: search as string,
      sort: sort as 'newest' | 'oldest' | 'status'
    };

    const result = await this.applyJobService.getApplicationsForCompany(companyId, params);

    ResponseUtil.paginated(
      res,
      result.data,
      result.total,
      result.page,
      result.limit,
      'Lấy danh sách ứng tuyển thành công'
    );
  });

  /**
   * @swagger
   * /apply:
   *   get:
   *     tags: [Ứng tuyển]
   *     summary: Lấy danh sách ứng tuyển của user
   *     description: Lấy danh sách ứng tuyển của user với thông tin chi tiết công việc và công ty
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Số trang (mặc định 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Số lượng bản ghi mỗi trang (mặc định 10)
   *     responses:
   *       200:
   *         description: Lấy danh sách ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - $ref: '#/components/schemas/PaginatedResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         data:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 36
   *                               idJob:
   *                                 type: integer
   *                                 example: 28
   *                               nameJob:
   *                                 type: string
   *                                 example: "ádasdasdas"
   *                               salaryMax:
   *                                 type: integer
   *                                 nullable: true
   *                                 example: 3
   *                               salaryMin:
   *                                 type: integer
   *                                 nullable: true
   *                                 example: 2
   *                               typeWork:
   *                                 type: string
   *                                 example: "Nhân viên chính thức"
   *                               idCompany:
   *                                 type: integer
   *                                 example: 15
   *                               province:
   *                                 type: string
   *                                 example: "Cao Bằng"
   *                               nameCompany:
   *                                 type: string
   *                                 example: "Công ty Test"
   *                               avatarPic:
   *                                 type: string
   *                                 nullable: true
   *                                 example: "1759903909746blob"
   *                               nameFields:
   *                                 type: string
   *                                 example: "Nhân sự"
   *                               createdAt:
   *                                 type: string
   *                                 format: date-time
   *                                 example: "2025-12-13T13:40:54.000Z"
   *                               status:
   *                                 type: integer
   *                                 example: 1
   *       401:
   *         description: Chưa đăng nhập
   *       500:
   *         description: Lỗi server
   */
  getUserApplicationsSimple = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { page, limit } = req.query;

    const params: ApplyJobQueryParams = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10
    };

    const result = await this.applyJobService.getApplicationsForUser(userId, params);

    ResponseUtil.paginated(
      res,
      result.data,
      result.total,
      result.page,
      result.limit,
      'Lấy danh sách ứng tuyển thành công'
    );
  });


  /**
   * @swagger
   * /apply/{id}:
   *   get:
   *     tags: [Ứng tuyển]
   *     summary: Lấy chi tiết ứng tuyển
   *     description: Xem chi tiết một đơn ứng tuyển (chỉ dành cho nhà tuyển dụng)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của đơn ứng tuyển
   *         example: 36
   *     responses:
   *       200:
   *         description: Lấy chi tiết ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 36
   *                         idUser:
   *                           type: integer
   *                           example: 24
   *                         idJob:
   *                           type: integer
   *                           example: 28
   *                         name:
   *                           type: string
   *                           example: "Trầm Khôi Nguyên"
   *                         email:
   *                           type: string
   *                           example: "tramkhoinguyen27122@gmail.com"
   *                         phone:
   *                           type: string
   *                           example: "0987769860"
   *                         status:
   *                           type: integer
   *                           example: 1
   *                         letter:
   *                           type: string
   *                           example: "<p>sdsd</p>"
   *                         cv:
   *                           type: string
   *                           example: "1765633254270cv.docx"
   *                         createdAt:
   *                           type: string
   *                           format: date-time
   *                           example: "2025-12-13T13:40:54.000Z"
   *                         deletedAt:
   *                           type: string
   *                           format: date-time
   *                           nullable: true
   *                           example: null
   *                         nameJob:
   *                           type: string
   *                           example: "ádasdasdas"
   *                         avatarPic:
   *                           type: string
   *                           nullable: true
   *                           example: null
   *                         sex:
   *                           type: string
   *                           nullable: true
   *                           example: null
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền truy cập
   *       404:
   *         description: Không tìm thấy đơn ứng tuyển
   *       500:
   *         description: Lỗi server
   */
  getApplicationDetail = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      return ResponseUtil.error(res, 'ID ứng tuyển là bắt buộc', 400);
    }

    // Chỉ cho phép nhà tuyển dụng xem
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Chưa đăng nhập', 401);
    }

    const application = await this.applyJobService.getApplicationById(
      Number(id),
      companyId
    );

    ResponseUtil.success(res, application, 'Lấy chi tiết ứng tuyển thành công');
  });

  /**
   * @swagger
   * /apply/status/{idJob}:
   *   get:
   *     tags: [Ứng tuyển]
   *     summary: Kiểm tra trạng thái ứng tuyển
   *     description: Kiểm tra xem user đã ứng tuyển vào job này chưa
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: idJob
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của công việc cần kiểm tra
   *         example: 1
   *     responses:
   *       200:
   *         description: Kiểm tra thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         hasApplied:
   *                           type: boolean
   *                           description: true nếu đã ứng tuyển, false nếu chưa
   *                           example: true
   *       400:
   *         description: Dữ liệu không hợp lệ
   *       401:
   *         description: Chưa đăng nhập
   *       500:
   *         description: Lỗi server
   */
  checkApplicationStatus = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { idJob } = req.params;
    if (!idJob) {
      return ResponseUtil.error(res, 'ID công việc là bắt buộc', 400);
    }

    const hasApplied = await this.applyJobService.checkUserAppliedStatus(userId, Number(idJob));

    ResponseUtil.success(res, { hasApplied }, 'Kiểm tra trạng thái thành công');
  });



  /**
   * @swagger
   * /apply/hidden:
   *   put:
   *     tags: [Ứng tuyển]
   *     summary: Ẩn đơn ứng tuyển
   *     description: Cho phép nhà tuyển dụng ẩn đơn ứng tuyển (soft delete)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: integer
   *                 description: ID của đơn ứng tuyển cần ẩn
   *                 example: 1
   *     responses:
   *       200:
   *         description: Ẩn đơn ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc đơn đã được ẩn
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền ẩn đơn ứng tuyển này
   *       404:
   *         description: Không tìm thấy đơn ứng tuyển
   *       500:
   *         description: Lỗi server
   */
  hideApplication = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { id } = req.body;
    if (!id) {
      return ResponseUtil.error(res, 'ID đơn ứng tuyển là bắt buộc', 400);
    }

    await this.applyJobService.hideApplication(Number(id), companyId);

    ResponseUtil.success(res, null, 'Ẩn đơn ứng tuyển thành công');
  });

  /**
   * @swagger
   * /apply/unHidden:
   *   put:
   *     tags: [Ứng tuyển]
   *     summary: Hủy ẩn đơn ứng tuyển
   *     description: Cho phép nhà tuyển dụng hủy ẩn đơn ứng tuyển (restore)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: integer
   *                 description: ID của đơn ứng tuyển cần hủy ẩn
   *                 example: 1
   *     responses:
   *       200:
   *         description: Hủy ẩn đơn ứng tuyển thành công
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc đơn không ở trạng thái ẩn
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền hủy ẩn đơn ứng tuyển này
   *       404:
   *         description: Không tìm thấy đơn ứng tuyển
   *       500:
   *         description: Lỗi server
   */
  unhideApplication = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { id } = req.body;
    if (!id) {
      return ResponseUtil.error(res, 'ID đơn ứng tuyển là bắt buộc', 400);
    }

    await this.applyJobService.unhideApplication(Number(id), companyId);

    ResponseUtil.success(res, null, 'Hủy ẩn đơn ứng tuyển thành công');
  });

  /**
   * @swagger
   * /apply/userHideApply:
   *   get:
   *     tags: [Ứng tuyển]
   *     summary: Lấy danh sách đơn ứng tuyển đã ẩn
   *     description: Cho phép nhà tuyển dụng xem danh sách các đơn ứng tuyển đã bị ẩn
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Số trang (mặc định 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Số lượng bản ghi mỗi trang (mặc định 10)
   *     responses:
   *       200:
   *         description: Lấy danh sách đơn ứng tuyển đã ẩn thành công
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - $ref: '#/components/schemas/PaginatedResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         data:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 36
   *                               idUser:
   *                                 type: integer
   *                                 example: 24
   *                               name:
   *                                 type: string
   *                                 example: "Trầm Khôi Nguyên"
   *                               status:
   *                                 type: integer
   *                                 example: 1
   *                               createdAt:
   *                                 type: string
   *                                 format: date-time
   *                                 example: "2025-12-13T13:40:54.000Z"
   *                               nameJob:
   *                                 type: string
   *                                 example: "ádasdasdas"
   *                               avatarPic:
   *                                 type: string
   *                                 nullable: true
   *                                 example: "1766114182365blob"
   *       401:
   *         description: Chưa đăng nhập
   *       403:
   *         description: Không có quyền truy cập
   *       500:
   *         description: Lỗi server
   */
  getHiddenApplications = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const companyId = req.user?.id;
    if (!companyId) {
      return ResponseUtil.error(res, 'Vui lòng đăng nhập', 401);
    }

    const { page, limit } = req.query;

    const params = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10
    };

    const result = await this.applyJobService.getHiddenApplications(companyId, params);

    ResponseUtil.paginated(
      res,
      result.data,
      result.total,
      result.page,
      result.limit,
      'Lấy danh sách đơn ứng tuyển đã ẩn thành công'
    );
  });
}