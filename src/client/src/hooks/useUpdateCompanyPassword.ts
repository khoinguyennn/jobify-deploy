import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export const useUpdateCompanyPassword = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePasswordRequest }): Promise<UpdatePasswordResponse> => {
      const requestData = {
        passwordOld: data.currentPassword,
        password: data.newPassword,
      };
      
      console.log('Sending password change request:', { id, requestData });
      
      const response = await apiClient.post(`/companies/${id}/password`, requestData);
      return response.data;
    },
    onSuccess: (data) => {
      showToast.success(data.message || 'Đổi mật khẩu thành công!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      showToast.error(errorMessage);
    },
  });
};
