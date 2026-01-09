import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

// Hook để gửi email forgot password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiClient.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: () => {
      showToast.success('Liên kết khôi phục mật khẩu đã được gửi!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Có lỗi xảy ra khi gửi email khôi phục';
      showToast.error(message);
    },
  });
};

// Hook để reset password với token
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await apiClient.put(`/auth/reset-password/${data.token}`, {
        password: data.password
      });
      return response.data;
    },
    onSuccess: () => {
      showToast.success('Mật khẩu đã được đặt lại thành công!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Có lỗi xảy ra khi đặt lại mật khẩu';
      showToast.error(message);
    },
  });
};
