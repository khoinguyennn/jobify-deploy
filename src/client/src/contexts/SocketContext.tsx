"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const connectSocket = () => {
      if (!isAuthenticated) {
        console.log('🔌 Frontend - Not authenticated, skipping socket connection');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔌 Frontend - No token found in localStorage');
        return;
      }

      console.log('🔌 Frontend - Attempting socket connection with token:', token.substring(0, 20) + '...');
      console.log('🔌 Frontend - Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      console.log('🔌 Frontend - User type:', userType);

      try {
        socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
          auth: {
            token: token
          },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('🔌 Socket connected successfully');
          setIsConnected(true);
          setConnectionError(null);
          
          // Test connection
          socketInstance?.emit('test_connection');
        });

        socketInstance.on('connection_success', (data) => {
          console.log('🔌 Connection test successful:', data);
        });

        socketInstance.on('disconnect', () => {
          console.log('🔌 Socket disconnected');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('🔌 Socket connection error:', error.message);
          setConnectionError(error.message);
          setIsConnected(false);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
          console.log(`🔌 Socket reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
          setConnectionError(null);
        });

        socketInstance.on('reconnect_error', (error) => {
          console.error('🔌 Socket reconnection error:', error);
        });

        setSocket(socketInstance);

      } catch (error) {
        console.error('🔌 Failed to initialize socket:', error);
        setConnectionError('Failed to initialize socket connection');
      }
    };

    const disconnectSocket = () => {
      if (socketInstance) {
        console.log('🔌 Disconnecting socket...');
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectionError(null);
      }
    };

    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    // Cleanup function
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, userType]);

  const value = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
