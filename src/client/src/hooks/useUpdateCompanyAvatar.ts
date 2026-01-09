import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export const useUpdateCompanyAvatar = () => {
  const queryClient = useQueryClient();
  const { updateCompany, company } = useAuth();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.put(`/companies/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (updatedCompany: any) => {
      // Lấy dữ liệu hiện tại từ cache hoặc AuthContext
      const currentCompanyData = queryClient.getQueryData(['company-profile']) || company;
      
      // Merge dữ liệu mới với dữ liệu cũ để giữ lại các field khác
      const mergedCompanyData = {
        ...currentCompanyData,
        ...updatedCompany,
        // Đảm bảo giữ lại các field quan trọng
        nameCompany: updatedCompany.nameCompany || currentCompanyData?.nameCompany,
        // API trả về fileName, cần map thành avatarPic
        avatarPic: updatedCompany.fileName || updatedCompany.avatarPic,
      };
      
      // Cập nhật cache của company profile
      queryClient.setQueryData(['company-profile'], mergedCompanyData);
      
      // Cập nhật AuthContext để navbar được cập nhật
      updateCompany(mergedCompanyData as any);
      
      // Invalidate để refetch data mới
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
    },
    onError: (error: any) => {
      console.error('Error updating company avatar:', error);
    }
  });
};
