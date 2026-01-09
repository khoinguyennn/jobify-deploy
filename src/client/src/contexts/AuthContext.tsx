"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService, User, Company, LoginRequest, RegisterRequest, CompanyLoginRequest, CompanyRegisterRequest } from '@/services/authService';
import { showToast } from '@/utils/toast';

interface AuthContextType {
  // State
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'user' | 'company' | null;
  avatarUpdateTime: number;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  loginCompany: (credentials: CompanyLoginRequest) => Promise<boolean>;
  registerCompany: (companyData: CompanyRegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  updateCompany: (updatedCompany: Company) => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'user' | 'company' | null>(null);
  const [avatarUpdateTime, setAvatarUpdateTime] = useState(0);

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();
        const currentCompany = authService.getCurrentCompany();
        const currentUserType = authService.getUserType();

        setIsAuthenticated(isAuth);
        setUser(currentUser);
        setCompany(currentCompany);
        setUserType(currentUserType);
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Đăng nhập
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear cache trước khi đăng nhập tài khoản mới
      queryClient.clear();
      
      const response = await authService.loginUser(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setCompany(null); // Clear company data
        setIsAuthenticated(true);
        setUserType('user');
        setAvatarUpdateTime(0); // Reset avatar update time
        showToast.success(response.message || 'Đăng nhập thành công!');
        return true;
      } else {
        showToast.error('Đăng nhập thất bại!');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error || error.message || 'Có lỗi xảy ra khi đăng nhập!';
      showToast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear cache trước khi đăng ký tài khoản mới
      queryClient.clear();
      
      const response = await authService.registerUser(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setCompany(null); // Clear company data
        setIsAuthenticated(true);
        setUserType('user');
        setAvatarUpdateTime(0); // Reset avatar update time
        showToast.success(response.message || 'Đăng ký thành công!');
        return true;
      } else {
        showToast.error('Đăng ký thất bại!');
        return false;
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.error || error.message || 'Có lỗi xảy ra khi đăng ký!';
      showToast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng nhập nhà tuyển dụng
  const loginCompany = async (credentials: CompanyLoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear cache trước khi đăng nhập tài khoản mới
      queryClient.clear();
      
      const response = await authService.loginCompany(credentials);
      
      if (response.success) {
        setCompany(response.data.company || null);
        setUser(null); // Clear user data
        setIsAuthenticated(true);
        setUserType('company');
        setAvatarUpdateTime(0); // Reset avatar update time
        showToast.success(response.message || 'Đăng nhập thành công!');
        return true;
      } else {
        showToast.error('Đăng nhập thất bại!');
        return false;
      }
    } catch (error: any) {
      console.error('Company login error:', error);
      const errorMessage = error.error || error.message || 'Có lỗi xảy ra khi đăng nhập!';
      showToast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký nhà tuyển dụng
  const registerCompany = async (companyData: CompanyRegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear cache trước khi đăng ký tài khoản mới
      queryClient.clear();
      
      const response = await authService.registerCompany(companyData);
      
      if (response.success) {
        setCompany(response.data.company || null);
        setUser(null); // Clear user data
        setIsAuthenticated(true);
        setUserType('company');
        setAvatarUpdateTime(0); // Reset avatar update time
        showToast.success(response.message || 'Đăng ký thành công!');
        return true;
      } else {
        showToast.error('Đăng ký thất bại!');
        return false;
      }
    } catch (error: any) {
      console.error('Company register error:', error);
      const errorMessage = error.error || error.message || 'Có lỗi xảy ra khi đăng ký!';
      showToast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Gọi API đăng xuất
      await authService.logout();
      
      // Clear tất cả cache của TanStack Query
      queryClient.clear();
      
      // Cập nhật state
      setUser(null);
      setCompany(null);
      setIsAuthenticated(false);
      setUserType(null);
      setAvatarUpdateTime(0);
      
      showToast.success('Đăng xuất thành công!');
      
      // Điều hướng về trang chủ
      router.push('/');
      
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Vẫn clear cache và local state ngay cả khi API fail
      queryClient.clear();
      setUser(null);
      setCompany(null);
      setIsAuthenticated(false);
      setUserType(null);
      setAvatarUpdateTime(0);
      
      // Clear localStorage manually nếu API fail
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      localStorage.removeItem('userType');
      
      showToast.warning('Đã đăng xuất (có lỗi kết nối server)');
      
      // Điều hướng về trang chủ ngay cả khi có lỗi
      router.push('/');
      
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = () => {
    try {
      const currentUser = authService.getCurrentUser();
      const currentCompany = authService.getCurrentCompany();
      const isAuth = authService.isAuthenticated();
      const currentUserType = authService.getUserType();
      
      setUser(currentUser);
      setCompany(currentCompany);
      setIsAuthenticated(isAuth);
      setUserType(currentUserType);
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  // Update company data
  const updateCompany = (updatedCompany: Company) => {
    try {
      // Cập nhật state
      setCompany(updatedCompany);
      
      // Cập nhật timestamp để force refresh avatar
      setAvatarUpdateTime(Date.now());
      
      // Cập nhật localStorage thông qua authService
      authService.updateCompanyData(updatedCompany);
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  // Update user data
  const updateUser = (updatedUser: User) => {
    try {
      // Cập nhật state
      setUser(updatedUser);
      
      // Cập nhật timestamp để force refresh avatar
      setAvatarUpdateTime(Date.now());
      
      // Cập nhật localStorage thông qua authService
      authService.updateUserData(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    company,
    isAuthenticated,
    isLoading,
    userType,
    avatarUpdateTime,
    login,
    register,
    loginCompany,
    registerCompany,
    logout,
    refreshUser,
    updateCompany,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để sử dụng Auth Context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
