import { apiClient } from './api';

// Types cho authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  idProvince?: number;
}

export interface CompanyLoginRequest {
  email: string;
  password: string;
}

export interface CompanyRegisterRequest {
  nameCompany: string;
  nameAdmin: string;
  email: string;
  password: string;
  phone: string;
  idProvince: number;
  scale?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  idProvince?: number;
  avatarPic?: string;
  intro?: string;
  address?: string;
  birthday?: string;
  sex?: string;
  education?: string;
  experience?: string;
  provinceName?: string;
  provinceFullName?: string;
}

export interface Company {
  id: number;
  nameCompany: string;
  nameAdmin: string;
  email: string;
  phone: string;
  idProvince?: number;
  avatarPic?: string;
  intro?: string;
  scale?: string;
  web?: string;
  provinceName?: string;
  provinceFullName?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user?: User;
    company?: Company;
    token: string;
  };
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

class AuthService {
  // Đăng nhập người tìm việc
  async loginUser(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/users/sessions', credentials);
      
      // Lưu token vào localStorage
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'user');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
      };
    }
  }

  // Đăng ký người tìm việc
  async registerUser(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users', userData);
      
      // Lưu token vào localStorage sau khi đăng ký thành công
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('userType', 'user');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
      };
    }
  }

  // Đăng nhập nhà tuyển dụng
  async loginCompany(credentials: CompanyLoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/companies/sessions', credentials);
      
      // Lưu token vào localStorage
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('company', JSON.stringify(response.data.data.company));
        localStorage.setItem('userType', 'company');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
      };
    }
  }

  // Đăng ký nhà tuyển dụng
  async registerCompany(companyData: CompanyRegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/companies', companyData);
      
      // Lưu token vào localStorage sau khi đăng ký thành công
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('company', JSON.stringify(response.data.data.company));
        localStorage.setItem('userType', 'company');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
      };
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      // Gọi API logout nếu có token
      const token = localStorage.getItem('token');
      if (token) {
        await apiClient.delete('/auth/sessions');
      }
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Luôn xóa dữ liệu local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      localStorage.removeItem('userType');
    }
  }

  // Kiểm tra trạng thái đăng nhập
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const company = localStorage.getItem('company');
    return !!(token && (user || company));
  }

  // Lấy thông tin user hiện tại
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Lấy thông tin company hiện tại
  getCurrentCompany(): Company | null {
    try {
      const companyStr = localStorage.getItem('company');
      if (companyStr) {
        return JSON.parse(companyStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing company data:', error);
      return null;
    }
  }

  // Lấy thông tin account hiện tại (user hoặc company)
  getCurrentAccount(): User | Company | null {
    const userType = this.getUserType();
    if (userType === 'user') {
      return this.getCurrentUser();
    } else if (userType === 'company') {
      return this.getCurrentCompany();
    }
    return null;
  }

  // Lấy token hiện tại
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Lấy loại user hiện tại
  getUserType(): 'user' | 'company' | null {
    return localStorage.getItem('userType') as 'user' | 'company' | null;
  }

  // Cập nhật dữ liệu company trong localStorage
  updateCompanyData(updatedCompany: Company): void {
    try {
      localStorage.setItem('company', JSON.stringify(updatedCompany));
    } catch (error) {
      console.error('Error updating company data in localStorage:', error);
    }
  }

  // Cập nhật dữ liệu user trong localStorage
  updateUserData(updatedUser: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user data in localStorage:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
