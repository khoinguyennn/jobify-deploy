import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';

interface CompanyForgotPasswordData {
  email: string;
}

interface CompanyResetPasswordData {
  token: string;
  password: string;
}

// Hook để gửi email forgot password cho company
export const useCompanyForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: CompanyForgotPasswordData) => {
      const response = await apiClient.post('/auth/companies/forgot-password', data);
      return response.data;
    },
    onSuccess: () => {
      showToast.success('Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Có lỗi xảy ra khi gửi email khôi phục';
      showToast.error(message);
    },
  });
};

// Hook để reset password cho company với token
export const useCompanyResetPassword = () => {
  return useMutation({
    mutationFn: async (data: CompanyResetPasswordData) => {
      const response = await apiClient.put(`/auth/companies/reset-password/${data.token}`, {
        password: data.password
      });
      return response.data;
    },
    onSuccess: () => {
      showToast.success('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Có lỗi xảy ra khi đặt lại mật khẩu';
      showToast.error(message);
    },
  });
};
