import { pool } from '@/config/database';
import { ApplyJob, ApplyJobDTO, ApplyStatus, PaginatedResponse } from '@/types';
import { ApplyJobModel } from '@/models/ApplyJob';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interface cho các tham số query của apply job
 */
export interface ApplyJobQueryParams {
  page?: number;
  limit?: number;
  idJob?: number;
  status?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'status';
}

/**
 * Interface cho thông tin chi tiết apply job với thông tin user và job
 */
export interface ApplyJobWithDetails extends ApplyJob {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userAvatar?: string;
  jobName?: string;
  companyName?: string;
  companyId?: number;
}

/**
 * ApplyJobRepository - Xử lý truy vấn database cho ApplyJob
 */
export class ApplyJobRepository {
  /**
   * Tạo ứng tuyển mới
   */
  async create(applyJobData: ApplyJobDTO): Promise<ApplyJob> {
    const row = ApplyJobModel.toRow(applyJobData);
    
    const query = `
      INSERT INTO apply_job (idUser, idJob, name, email, phone, letter, cv, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(query, [
      row.idUser,
      row.idJob,
      row.name,
      row.email,
      row.phone,
      row.letter || null,
      row.cv || null,
      row.status,
      row.createdAt
    ]);

    const createdApplyJob = await this.findById(result.insertId);
    if (!createdApplyJob) {
      throw new Error('Không thể tạo ứng tuyển');
    }
    
    return createdApplyJob;
  }

  /**
   * Tìm ứng tuyển theo ID (chỉ active)
   */
  async findById(id: number): Promise<ApplyJob | null> {
    const query = `
      SELECT * FROM apply_job 
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) return null;
    
    return ApplyJobModel.fromRow(rows[0]);
  }

  /**
   * Tìm ứng tuyển theo ID (bao gồm cả đã ẩn)
   */
  async findByIdIncludingHidden(id: number): Promise<ApplyJob | null> {
    const query = `
      SELECT * FROM apply_job 
      WHERE id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) return null;
    
    return ApplyJobModel.fromRow(rows[0]);
  }

  /**
   * Tìm ứng tuyển theo user và job
   */
  async findByUserAndJob(idUser: number, idJob: number): Promise<ApplyJob | null> {
    const query = `
      SELECT * FROM apply_job 
      WHERE idUser = ? AND idJob = ? AND deletedAt IS NULL
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [idUser, idJob]);
    
    if (rows.length === 0) return null;
    
    return ApplyJobModel.fromRow(rows[0]);
  }

  /**
   * Cập nhật trạng thái ứng tuyển
   */
  async updateStatus(id: number, status: ApplyStatus, updatedBy: number): Promise<boolean> {
    const query = `
      UPDATE apply_job 
      SET status = ?
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(query, [status, id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Hủy ứng tuyển (hard delete - xóa hoàn toàn)
   */
  async delete(idUser: number, idJob: number): Promise<boolean> {
    const query = `
      DELETE FROM apply_job 
      WHERE idUser = ? AND idJob = ?
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(query, [idUser, idJob]);
    
    return result.affectedRows > 0;
  }

  /**
   * Ẩn đơn ứng tuyển (Company action - soft delete)
   */
  async hide(applicationId: number): Promise<boolean> {
    const query = `
      UPDATE apply_job 
      SET deletedAt = NOW() 
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(query, [applicationId]);
    
    return result.affectedRows > 0;
  }

  /**
   * Hủy ẩn đơn ứng tuyển (Company action - restore)
   */
  async unhide(applicationId: number): Promise<boolean> {
    const query = `
      UPDATE apply_job 
      SET deletedAt = NULL 
      WHERE id = ? AND deletedAt IS NOT NULL
    `;
    
    const [result] = await pool.execute<ResultSetHeader>(query, [applicationId]);
    
    return result.affectedRows > 0;
  }

  /**
   * Lấy danh sách ứng tuyển của user với phân trang
   */
  async findByUser(idUser: number, params: ApplyJobQueryParams = {}): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      idJob,
      status,
      sort = 'newest'
    } = params;

    // Ensure limit and page are integers
    const limitInt = parseInt(limit.toString());
    const pageInt = parseInt(page.toString());
    const offset = (pageInt - 1) * limitInt;

    // Build WHERE clause
    let whereClause = 'aj.idUser = ? AND aj.deletedAt IS NULL';
    const queryParams: any[] = [idUser];

    if (idJob) {
      whereClause += ' AND aj.idJob = ?';
      queryParams.push(idJob);
    }

    if (status !== undefined) {
      whereClause += ' AND aj.status = ?';
      queryParams.push(status);
    }

    // Build ORDER BY clause
    let orderByClause = '';
    switch (sort) {
      case 'oldest':
        orderByClause = 'ORDER BY aj.createdAt ASC';
        break;
      case 'status':
        orderByClause = 'ORDER BY aj.status ASC, aj.createdAt DESC';
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY aj.createdAt DESC';
        break;
    }

    // Query với JOIN để lấy đầy đủ thông tin theo format yêu cầu
    const dataQuery = `
      SELECT 
        aj.id,
        aj.idJob,
        j.nameJob,
        j.salaryMax,
        j.salaryMin,
        j.typeWork,
        j.idCompany,
        p.name as province,
        c.nameCompany,
        c.avatarPic,
        f.name as nameFields,
        aj.createdAt,
        aj.status
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      LEFT JOIN users u ON aj.idUser = u.id
      INNER JOIN companies c ON j.idCompany = c.id
      INNER JOIN provinces p ON j.idProvince = p.id
      INNER JOIN fields f ON j.idField = f.id
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      LEFT JOIN users u ON aj.idUser = u.id
      WHERE ${whereClause}
    `;

    // Execute queries
    const [dataRows] = await pool.execute<RowDataPacket[]>(dataQuery, queryParams);
    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limitInt);

    // Map data theo format yêu cầu
    const data = dataRows.map(row => ({
      id: row.id,
      idJob: row.idJob,
      nameJob: row.nameJob,
      salaryMax: row.salaryMax,
      salaryMin: row.salaryMin,
      typeWork: row.typeWork,
      idCompany: row.idCompany,
      province: row.province,
      nameCompany: row.nameCompany,
      avatarPic: row.avatarPic,
      nameFields: row.nameFields,
      createdAt: row.createdAt,
      status: row.status
    }));

    return {
      data,
      total,
      page: pageInt,
      limit: limitInt,
      totalPages
    };
  }

  /**
   * Lấy danh sách ứng tuyển cho company với filter
   */
  async findByCompany(idCompany: number, params: ApplyJobQueryParams = {}): Promise<PaginatedResponse<ApplyJobWithDetails>> {
    const {
      page = 1,
      limit = 10,
      idJob,
      status,
      search,
      sort = 'newest'
    } = params;

    const offset = (page - 1) * limit;

    // Build WHERE clause theo đúng schema - Company lấy các ứng tuyển cho jobs của mình
    let whereClause = 'j.idCompany = ? AND aj.deletedAt IS NULL';
    const queryParams: any[] = [idCompany];

    if (idJob) {
      whereClause += ' AND aj.idJob = ?';
      queryParams.push(idJob);
    }

    if (status !== undefined) {
      whereClause += ' AND aj.status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND (aj.name LIKE ? OR aj.email LIKE ? OR j.nameJob LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Build ORDER BY clause với alias đúng
    let orderByClause = '';
    switch (sort) {
      case 'oldest':
        orderByClause = 'ORDER BY aj.createdAt ASC';
        break;
      case 'status':
        orderByClause = 'ORDER BY aj.status ASC, aj.createdAt DESC';
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY aj.createdAt DESC';
        break;
    }

    // Query chính để lấy dữ liệu thực
    const limitInt = parseInt(limit.toString());
    const offsetInt = parseInt(offset.toString());

    const dataQuery = `
      SELECT 
        aj.*,
        j.nameJob,
        j.\`desc\` as jobDesc,
        j.salaryMin,
        j.salaryMax,
        j.typeWork,
        j.education,
        j.experience,
        u.avatarPic as userAvatar,
        u.name as userName,
        u.email as userEmail,
        u.phone as userPhone
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      LEFT JOIN users u ON aj.idUser = u.id
      WHERE ${whereClause}
      ${orderByClause}
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      LEFT JOIN users u ON aj.idUser = u.id
      WHERE ${whereClause}
    `;

    const [dataRows] = await pool.execute<RowDataPacket[]>(dataQuery, queryParams);
    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limitInt);

      const data = dataRows.map((row: any) => ({
        ...ApplyJobModel.fromRow(row),
        job: {
          nameJob: row.nameJob,
          desc: row.jobDesc,
          salaryMin: row.salaryMin,
          salaryMax: row.salaryMax,
          typeWork: row.typeWork,
          education: row.education,
          experience: row.experience
        },
        user: {
          name: row.userName,
          email: row.userEmail,
          phone: row.userPhone,
          avatar: row.userAvatar
        }
      }));

      return {
        data,
        total,
        page,
        limit: limitInt,
        totalPages
      };
  }

  /**
   * Kiểm tra xem user đã apply job này chưa
   */
  async hasUserApplied(idUser: number, idJob: number): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM apply_job 
      WHERE idUser = ? AND idJob = ? AND deletedAt IS NULL
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [idUser, idJob]);
    
    return rows[0].count > 0;
  }


  /**
   * Lấy số lượng ứng tuyển theo trạng thái cho company
   */
  async getCompanyApplyStats(idCompany: number): Promise<Record<string, number>> {
    const query = `
      SELECT aj.status, COUNT(*) as count
      FROM apply_job aj
      LEFT JOIN jobs j ON aj.idJob = j.id
      WHERE j.idCompany = ? AND aj.deletedAt IS NULL
      GROUP BY aj.status
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [idCompany]);
    
    const result: Record<string, number> = {
      [ApplyStatus.NOT_VIEWED]: 0,
      [ApplyStatus.VIEWED]: 0,
      [ApplyStatus.INTERVIEW]: 0,
      [ApplyStatus.REJECTED]: 0,
      [ApplyStatus.ACCEPTED]: 0,
      total: 0
    };
    
    let total = 0;
    rows.forEach(row => {
      result[row.status] = row.count;
      total += row.count;
    });
    
    result.total = total;
    
    return result;
  }

  /**
   * Thống kê số lượng ứng tuyển theo trạng thái cho một job cụ thể
   */
  async getApplyCountByStatus(jobId: number): Promise<Record<string, number>> {
    const query = `
      SELECT status, COUNT(*) as count
      FROM apply_job 
      WHERE idJob = ? AND deletedAt IS NULL
      GROUP BY status
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [jobId]);
    
    const result: Record<string, number> = {
      [ApplyStatus.NOT_VIEWED]: 0,
      [ApplyStatus.VIEWED]: 0,
      [ApplyStatus.INTERVIEW]: 0,
      [ApplyStatus.REJECTED]: 0,
      [ApplyStatus.ACCEPTED]: 0,
      total: 0
    };
    
    let total = 0;
    rows.forEach((row: any) => {
      result[row.status] = row.count;
      total += row.count;
    });
    
    result.total = total;
    
    return result;
  }

  // Lấy danh sách đơn ứng tuyển đã ẩn của công ty
  async findHiddenByCompany(
    companyId: number, 
    params: { page: number; limit: number }
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Đảm bảo các giá trị là số nguyên
    const safeCompanyId = parseInt(companyId.toString());
    const safeOffset = parseInt(offset.toString());
    const safeLimit = parseInt(limit.toString());

    // Query để lấy đơn ứng tuyển đã ẩn - sử dụng string interpolation cho LIMIT
    const query = `
      SELECT 
        aj.id,
        aj.idUser,
        aj.name,
        aj.status,
        aj.createdAt,
        j.nameJob,
        u.avatarPic
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      LEFT JOIN users u ON aj.idUser = u.id
      WHERE j.idCompany = ? 
        AND aj.deletedAt IS NOT NULL
      ORDER BY aj.deletedAt DESC
      LIMIT ${safeOffset}, ${safeLimit}
    `;

    // Query để đếm tổng số
    const countQuery = `
      SELECT COUNT(*) as total
      FROM apply_job aj
      INNER JOIN jobs j ON aj.idJob = j.id
      WHERE j.idCompany = ? 
        AND aj.deletedAt IS NOT NULL
    `;

    try {
      console.log('Query parameters:', { companyId: safeCompanyId, offset: safeOffset, limit: safeLimit });
      
      // Lấy dữ liệu
      const [rows] = await pool.execute<RowDataPacket[]>(query, [safeCompanyId]);
      
      // Đếm tổng số
      const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, [safeCompanyId]);
      const total = countRows[0]?.total || 0;

      console.log('Query results:', { rowCount: rows.length, total });

      return {
        data: rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error finding hidden applications by company:', error);
      throw new Error('Không thể lấy danh sách đơn ứng tuyển đã ẩn');
    }
  }
}
