import { ApplyJobRepository, ApplyJobQueryParams, ApplyJobWithDetails } from '@/repositories/applyJobRepository';
import { JobRepository } from '@/repositories/jobRepository';
import { UserRepository } from '@/repositories/userRepository';
import { CompanyRepository } from '@/repositories/companyRepository';
import { ApplyJob, ApplyJobDTO, ApplyStatus, PaginatedResponse } from '@/types';
import { ApplyJobModel } from '@/models/ApplyJob';
import { pool } from '@/config/database';
import { RowDataPacket } from 'mysql2';
import { NotificationService } from './notificationService';

/**
 * ApplyJobService - Business logic cho ApplyJob
 */
export class ApplyJobService {
  private applyJobRepository: ApplyJobRepository;
  private jobRepository: JobRepository;
  private userRepository: UserRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.applyJobRepository = new ApplyJobRepository();
    this.jobRepository = new JobRepository();
    this.userRepository = new UserRepository();
    this.companyRepository = new CompanyRepository();
  }

  /**
   * Ứng tuyển công việc (Ứng viên)
   */
  async applyForJob(applyJobData: ApplyJobDTO): Promise<ApplyJob> {
    // Validate dữ liệu đầu vào
    const validationErrors = ApplyJobModel.validateApplyJob(applyJobData);
    if (validationErrors.length > 0) {
      throw new Error(`Dữ liệu không hợp lệ: ${validationErrors.join(', ')}`);
    }

    // Kiểm tra xem job có tồn tại không
    const job = await this.jobRepository.findById(applyJobData.idJob);
    if (!job) {
      throw new Error('Công việc không tồn tại');
    }

    // Kiểm tra xem job có bị xóa hoặc ẩn không
    if (job.deletedAt) {
      throw new Error('Công việc không khả dụng');
    }

    // Kiểm tra xem user có tồn tại không
    const user = await this.userRepository.findById(applyJobData.idUser);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Kiểm tra xem user đã apply job này chưa
    const hasApplied = await this.applyJobRepository.hasUserApplied(
      applyJobData.idUser,
      applyJobData.idJob
    );
    if (hasApplied) {
      throw new Error('Bạn đã ứng tuyển công việc này rồi');
    }

    // Tạo ứng tuyển mới với status mặc định là NOT_VIEWED
    const newApplyJob = await this.applyJobRepository.create({
      ...applyJobData,
      // Có thể override một số thông tin từ user profile
      name: applyJobData.name || user.name,
      email: applyJobData.email || user.email,
      phone: applyJobData.phone || user.phone,
    });

    // Tạo thông báo cho nhà tuyển dụng
    try {
      await NotificationService.notifyJobApplication(
        job.idCompany,
        job.nameJob,
        user.name
      );
    } catch (notificationError) {
      // Log lỗi nhưng không fail toàn bộ process
      console.error('Failed to send job application notification:', notificationError);
    }

    return newApplyJob;
  }

  /**
   * Hủy ứng tuyển (Ứng viên)
   */
  async cancelApplication(idUser: number, idJob: number): Promise<void> {
    // Kiểm tra xem ứng tuyển có tồn tại không
    const application = await this.applyJobRepository.findByUserAndJob(idUser, idJob);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    // Chỉ cho phép hủy ứng tuyển khi trạng thái còn là NOT_VIEWED hoặc VIEWED
    if (application.status === ApplyStatus.INTERVIEW || 
        application.status === ApplyStatus.ACCEPTED ||
        application.status === ApplyStatus.REJECTED) {
      throw new Error('Không thể hủy ứng tuyển ở trạng thái này');
    }

    const success = await this.applyJobRepository.delete(idUser, idJob);
    if (!success) {
      throw new Error('Không thể hủy ứng tuyển');
    }
  }

  /**
   * Cập nhật trạng thái ứng tuyển (Nhà tuyển dụng)
   */
  async updateApplicationStatus(
    applicationId: number,
    newStatus: ApplyStatus,
    companyId: number
  ): Promise<ApplyJob> {
    // Kiểm tra xem ứng tuyển có tồn tại không
    const application = await this.applyJobRepository.findById(applicationId);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    // Kiểm tra xem job có thuộc về company này không
    const job = await this.jobRepository.findById(application.idJob);
    if (!job || job.idCompany !== companyId) {
      throw new Error('Bạn không có quyền cập nhật đơn ứng tuyển này');
    }

    // Validate trạng thái mới
    if (!ApplyJobModel.isValidStatus(newStatus)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    // Validate chuyển trạng thái logic
    if (!this.isValidStatusTransition(application.status, newStatus)) {
      throw new Error('Không thể chuyển từ trạng thái hiện tại sang trạng thái mới');
    }

    const success = await this.applyJobRepository.updateStatus(applicationId, newStatus, companyId);
    if (!success) {
      throw new Error('Không thể cập nhật trạng thái');
    }

    // Trả về ứng tuyển đã cập nhật
    const updatedApplication = await this.applyJobRepository.findById(applicationId);
    if (!updatedApplication) {
      throw new Error('Lỗi khi lấy thông tin ứng tuyển đã cập nhật');
    }

    // Tạo thông báo cho ứng viên về việc cập nhật trạng thái
    try {
      const user = await this.userRepository.findById(updatedApplication.idUser);
      const company = await this.companyRepository.findById(job!.idCompany);
      
      let statusText = 'đã được cập nhật';
      switch (newStatus) {
        case ApplyStatus.ACCEPTED:
          statusText = 'accepted';
          break;
        case ApplyStatus.REJECTED:
          statusText = 'rejected';
          break;
        case ApplyStatus.VIEWED:
          statusText = 'under_review';
          break;
        case ApplyStatus.INTERVIEW:
          statusText = 'under_review';
          break;
      }

      if (user) {
        await NotificationService.notifyApplicationStatusUpdate(
          user.id,
          job!.nameJob,
          statusText,
          company?.nameCompany || 'Công ty'
        );
      }
    } catch (notificationError) {
      // Log lỗi nhưng không fail toàn bộ process
      console.error('Failed to send application status update notification:', notificationError);
    }

    return updatedApplication;
  }

  /**
   * Lấy danh sách ứng tuyển cho nhà tuyển dụng với filter
   */
  async getApplicationsForCompany(
    companyId: number,
    params: ApplyJobQueryParams = {}
  ): Promise<PaginatedResponse<ApplyJobWithDetails>> {
    // Kiểm tra xem company có tồn tại không
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    return await this.applyJobRepository.findByCompany(companyId, params);
  }

  /**
   * Lấy danh sách ứng tuyển của user
   */
  async getApplicationsForUser(
    userId: number,
    params: ApplyJobQueryParams = {}
  ): Promise<PaginatedResponse<any>> {
    // Kiểm tra xem user có tồn tại không
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    return await this.applyJobRepository.findByUser(userId, params);
  }

  /**
   * Lấy chi tiết ứng tuyển cho nhà tuyển dụng
   */
  async getApplicationById(applicationId: number, companyId: number): Promise<any> {
    const application = await this.applyJobRepository.findById(applicationId);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    // Kiểm tra quyền truy cập - chỉ cho phép company xem đơn của công ty mình
    const job = await this.jobRepository.findById(application.idJob);
    if (!job || job.idCompany !== companyId) {
      throw new Error('Bạn không có quyền xem đơn ứng tuyển này');
    }

    // Lấy thông tin user
    const user = await this.userRepository.findById(application.idUser);

    // Trả về format theo yêu cầu
    return {
      id: application.id,
      idUser: application.idUser,
      idJob: application.idJob,
      name: application.name,
      email: application.email,
      phone: application.phone,
      status: application.status,
      letter: application.letter,
      cv: application.cv,
      createdAt: application.createdAt,
      deletedAt: application.deletedAt,
      nameJob: job.nameJob,
      avatarPic: user?.avatarPic || null,
      sex: user?.sex || null
    };
  }

  /**
   * Lấy thống kê ứng tuyển cho company
   */
  async getCompanyApplyStats(companyId: number): Promise<Record<string, number>> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    return await this.applyJobRepository.getCompanyApplyStats(companyId);
  }

  /**
   * Lấy thống kê ứng tuyển cho một job
   */
  async getJobApplyStats(jobId: number, companyId: number): Promise<Record<string, number>> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error('Công việc không tồn tại');
    }

    if (job.idCompany !== companyId) {
      throw new Error('Bạn không có quyền xem thống kê công việc này');
    }

    return await this.applyJobRepository.getApplyCountByStatus(jobId);
  }

  /**
   * Kiểm tra xem user đã apply job này chưa
   */
  async checkUserAppliedStatus(userId: number, jobId: number): Promise<boolean> {
    return await this.applyJobRepository.hasUserApplied(userId, jobId);
  }

  /**
   * Kiểm tra logic chuyển trạng thái
   */
  private isValidStatusTransition(currentStatus: ApplyStatus, newStatus: ApplyStatus): boolean {
    // Luồng chuyển trạng thái hợp lý:
    // NOT_VIEWED -> VIEWED, REJECTED
    // VIEWED -> NOT_VIEWED, INTERVIEW, REJECTED (cho phép chuyển ngược)  
    // INTERVIEW -> VIEWED, ACCEPTED, REJECTED (cho phép chuyển ngược)
    // REJECTED -> có thể chuyển lại các trạng thái khác (cho phép chuyển ngược)
    // ACCEPTED -> có thể chuyển lại các trạng thái khác (cho phép chuyển ngược)

    switch (currentStatus) {
      case ApplyStatus.NOT_VIEWED:
        return [ApplyStatus.VIEWED, ApplyStatus.REJECTED].includes(newStatus);
      
      case ApplyStatus.VIEWED:
        return [ApplyStatus.NOT_VIEWED, ApplyStatus.INTERVIEW, ApplyStatus.REJECTED].includes(newStatus);
      
      case ApplyStatus.INTERVIEW:
        return [ApplyStatus.VIEWED, ApplyStatus.ACCEPTED, ApplyStatus.REJECTED].includes(newStatus);
      
      case ApplyStatus.REJECTED:
        return [ApplyStatus.NOT_VIEWED, ApplyStatus.VIEWED, ApplyStatus.INTERVIEW, ApplyStatus.ACCEPTED].includes(newStatus);
        
      case ApplyStatus.ACCEPTED:
        return [ApplyStatus.NOT_VIEWED, ApplyStatus.VIEWED, ApplyStatus.INTERVIEW, ApplyStatus.REJECTED].includes(newStatus);
      
      default:
        return false;
    }
  }

  /**
   * Ẩn đơn ứng tuyển (Nhà tuyển dụng)
   */
  async hideApplication(applicationId: number, companyId: number): Promise<void> {
    // Kiểm tra đơn ứng tuyển có tồn tại và thuộc về công ty này không
    const application = await this.applyJobRepository.findById(applicationId);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    // Kiểm tra job có thuộc về company này không
    const job = await this.jobRepository.findById(application.idJob);
    if (!job || job.idCompany !== companyId) {
      throw new Error('Bạn không có quyền ẩn đơn ứng tuyển này');
    }

    // Kiểm tra đơn ứng tuyển đã bị ẩn chưa
    if (application.deletedAt) {
      throw new Error('Đơn ứng tuyển đã được ẩn rồi');
    }

    const success = await this.applyJobRepository.hide(applicationId);
    if (!success) {
      throw new Error('Không thể ẩn đơn ứng tuyển');
    }
  }

  /**
   * Hủy ẩn đơn ứng tuyển (Nhà tuyển dụng)
   */
  async unhideApplication(applicationId: number, companyId: number): Promise<void> {
    // Lấy thông tin đơn ứng tuyển kể cả đã ẩn
    const application = await this.applyJobRepository.findByIdIncludingHidden(applicationId);
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển');
    }

    // Kiểm tra job có thuộc về company này không
    const job = await this.jobRepository.findById(application.idJob);
    if (!job || job.idCompany !== companyId) {
      throw new Error('Bạn không có quyền hủy ẩn đơn ứng tuyển này');
    }

    // Kiểm tra đơn ứng tuyển có đang bị ẩn không
    if (!application.deletedAt) {
      throw new Error('Đơn ứng tuyển không ở trạng thái ẩn');
    }

    const success = await this.applyJobRepository.unhide(applicationId);
    if (!success) {
      throw new Error('Không thể hủy ẩn đơn ứng tuyển');
    }
  }

  /**
   * Lấy danh sách đơn ứng tuyển đã ẩn của công ty
   */
  async getHiddenApplications(
    companyId: number,
    params: { page: number; limit: number }
  ): Promise<PaginatedResponse<any>> {
    return await this.applyJobRepository.findHiddenByCompany(companyId, params);
  }
}