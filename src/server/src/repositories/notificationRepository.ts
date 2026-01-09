import { pool } from '@/config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Notification, CreateNotificationDTO, NotificationQueryParams } from '@/types/notification';

export class NotificationRepository {
  
  /**
   * Tạo notification mới
   */
  static async create(data: CreateNotificationDTO): Promise<Notification> {
    const query = `
      INSERT INTO notifications (idUser, idCompany, title, content, type, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await pool.execute(query, [
      data.idUser || null,
      data.idCompany || null,
      data.title,
      data.content,
      data.type
    ]) as [ResultSetHeader, any];
    
    return this.findById(result.insertId);
  }

  /**
   * Tìm notification theo ID
   */
  static async findById(id: number): Promise<Notification> {
    const query = `
      SELECT id, idUser, idCompany, title, content, type, isRead, createdAt
      FROM notifications 
      WHERE id = ?
    `;
    
    const [rows] = await pool.execute(query, [id]) as [RowDataPacket[], any];
    
    if (rows.length === 0) {
      throw new Error('Notification not found');
    }
    
    return this.mapRowToNotification(rows[0]);
  }

  /**
   * Lấy notifications của user
   */
  static async findByUser(
    userId: number, 
    params: NotificationQueryParams = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, isRead } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE idUser = ?';
    const queryParams: any[] = [userId];
    
    if (isRead !== undefined) {
      whereClause += ' AND isRead = ?';
      queryParams.push(isRead ? 1 : 0);
    }
    
    // Query để đếm tổng số
    const countQuery = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    const [countRows] = await pool.execute(countQuery, queryParams) as [RowDataPacket[], any];
    const total = countRows[0].total;
    
    // Query để lấy data với pagination
    const query = `
      SELECT id, idUser, idCompany, title, content, type, isRead, createdAt
      FROM notifications 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [rows] = await pool.execute(query, queryParams) as [RowDataPacket[], any];
    
    return {
      notifications: rows.map(this.mapRowToNotification),
      total
    };
  }

  /**
   * Lấy notifications của company
   */
  static async findByCompany(
    companyId: number, 
    params: NotificationQueryParams = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, isRead } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE idCompany = ?';
    const queryParams: any[] = [companyId];
    
    if (isRead !== undefined) {
      whereClause += ' AND isRead = ?';
      queryParams.push(isRead ? 1 : 0);
    }
    
    // Query để đếm tổng số
    const countQuery = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    const [countRows] = await pool.execute(countQuery, queryParams) as [RowDataPacket[], any];
    const total = countRows[0].total;
    
    // Query để lấy data với pagination
    const query = `
      SELECT id, idUser, idCompany, title, content, type, isRead, createdAt
      FROM notifications 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [rows] = await pool.execute(query, queryParams) as [RowDataPacket[], any];
    
    return {
      notifications: rows.map(this.mapRowToNotification),
      total
    };
  }

  /**
   * Đánh dấu notification đã đọc
   */
  static async markAsRead(id: number, userId?: number, companyId?: number): Promise<void> {
    let query = 'UPDATE notifications SET isRead = 1 WHERE id = ?';
    const params = [id];
    
    // Thêm điều kiện để đảm bảo chỉ owner mới có thể mark as read
    if (userId) {
      query += ' AND idUser = ?';
      params.push(userId);
    } else if (companyId) {
      query += ' AND idCompany = ?';
      params.push(companyId);
    }
    
    await pool.execute(query, params);
  }

  /**
   * Đánh dấu tất cả notifications đã đọc
   */
  static async markAllAsRead(userId?: number, companyId?: number): Promise<void> {
    let query = 'UPDATE notifications SET isRead = 1';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE idUser = ?';
      params.push(userId);
    } else if (companyId) {
      query += ' WHERE idCompany = ?';
      params.push(companyId);
    }
    
    await pool.execute(query, params);
  }

  /**
   * Xóa notification
   */
  static async delete(id: number, userId?: number, companyId?: number): Promise<void> {
    let query = 'DELETE FROM notifications WHERE id = ?';
    const params = [id];
    
    if (userId) {
      query += ' AND idUser = ?';
      params.push(userId);
    } else if (companyId) {
      query += ' AND idCompany = ?';
      params.push(companyId);
    }
    
    await pool.execute(query, params);
  }

  /**
   * Đếm số notification chưa đọc
   */
  static async countUnread(userId?: number, companyId?: number): Promise<number> {
    let query = 'SELECT COUNT(*) as unreadCount FROM notifications WHERE isRead = 0';
    const params: any[] = [];
    
    if (userId) {
      query += ' AND idUser = ?';
      params.push(userId);
    } else if (companyId) {
      query += ' AND idCompany = ?';
      params.push(companyId);
    }
    
    const [rows] = await pool.execute(query, params) as [RowDataPacket[], any];
    return rows[0].unreadCount;
  }

  /**
   * Map database row to Notification object
   */
  private static mapRowToNotification(row: RowDataPacket): Notification {
    return {
      id: row.id,
      idUser: row.idUser,
      idCompany: row.idCompany,
      title: row.title,
      content: row.content,
      type: row.type,
      isRead: Boolean(row.isRead),
      createdAt: row.createdAt
    };
  }
}
































