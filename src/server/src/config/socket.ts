import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { pool } from './database';
import { RowDataPacket } from 'mysql2';

interface AuthenticatedSocket extends SocketIOServer {
  userId?: number;
  userType?: 'user' | 'company';
  companyId?: number;
}

let io: SocketIOServer | null = null;

export const setupSocket = (server: Server): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware để xác thực JWT token
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      
      console.log('🔌 Socket auth - Token received:', token ? 'Yes' : 'No');
      console.log('🔌 Socket auth - JWT_SECRET exists:', !!process.env.JWT_SECRET);
      
      if (!token) {
        console.log('🔌 Socket auth - No token provided');
        return next(new Error('Authentication token required'));
      }

      if (!process.env.JWT_SECRET) {
        console.log('🔌 Socket auth - JWT_SECRET not configured');
        return next(new Error('JWT secret not configured'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      console.log('🔌 Socket auth - Token decoded successfully:', { id: decoded.id, userType: decoded.userType });
      
      // Kiểm tra user hoặc company tồn tại
      if (decoded.userType === 'user') {
        const [userRows] = await pool.execute(
          'SELECT id FROM users WHERE id = ?',
          [decoded.id]
        ) as [RowDataPacket[], any];
        
        if (userRows.length === 0) {
          console.log('🔌 Socket auth - User not found in database:', decoded.id);
          return next(new Error('User not found'));
        }
        
        socket.userId = decoded.id;
        socket.userType = 'user';
        console.log('🔌 Socket auth - User authenticated successfully:', decoded.id);
      } else if (decoded.userType === 'company') {
        const [companyRows] = await pool.execute(
          'SELECT id FROM companies WHERE id = ?',
          [decoded.id]
        ) as [RowDataPacket[], any];
        
        if (companyRows.length === 0) {
          console.log('🔌 Socket auth - Company not found in database:', decoded.id);
          return next(new Error('Company not found'));
        }
        
        socket.companyId = decoded.id;
        socket.userType = 'company';
        console.log('🔌 Socket auth - Company authenticated successfully:', decoded.id);
      } else {
        console.log('🔌 Socket auth - Invalid user type:', decoded.userType);
        return next(new Error('Invalid user type'));
      }

      next();
    } catch (error) {
      console.error('🔌 Socket authentication error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        next(new Error('Invalid JWT token'));
      } else if (error instanceof jwt.TokenExpiredError) {
        next(new Error('Token expired'));
      } else {
        next(new Error('Authentication failed'));
      }
    }
  });

  io.on('connection', (socket: any) => {
    const { userId, userType, companyId } = socket;
    const roomName = userType === 'user' ? `user_${userId}` : `company_${companyId}`;
    
    // Join room dựa trên user type và ID
    socket.join(roomName);
    
    console.log(`🔌 Socket connected: ${socket.id} - ${userType}:${userId || companyId} - Room: ${roomName}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id} - ${roomName}`);
    });

    // Event test để kiểm tra kết nối
    socket.on('test_connection', () => {
      socket.emit('connection_success', {
        message: 'Socket connection successful',
        userType,
        userId: userId || companyId,
        roomName
      });
    });
  });

  return io;
};

// Hàm để gửi notification real-time
export const sendNotificationToUser = (userId: number, notification: any) => {
  if (io) {
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

export const sendNotificationToCompany = (companyId: number, notification: any) => {
  if (io) {
    io.to(`company_${companyId}`).emit('new_notification', notification);
  }
};

export const getSocketInstance = () => io;
