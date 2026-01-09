import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useUpdateUserAvatar = () => {
  const queryClient = useQueryClient();
  const { updateUser, user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.put(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (updatedUser: any) => {
      // Lấy dữ liệu hiện tại từ cache hoặc AuthContext
      const currentUserData = queryClient.getQueryData(['userProfile']) || user;
      
      // Merge dữ liệu mới với dữ liệu cũ để giữ lại các field khác
      const mergedUserData = {
        ...currentUserData,
        ...updatedUser,
        // Đảm bảo giữ lại các field quan trọng
        name: updatedUser.name || currentUserData?.name,
        // API trả về fileName, cần map thành avatarPic
        avatarPic: updatedUser.fileName || updatedUser.avatarPic,
      };
      
      // Cập nhật cache của user profile
      queryClient.setQueryData(['userProfile'], mergedUserData);
      
      // Cập nhật AuthContext để navbar được cập nhật
      updateUser(mergedUserData as any);
      
      // Invalidate để refetch data mới
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      console.error('Error updating user avatar:', error);
    }
  });
};
