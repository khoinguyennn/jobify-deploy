import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const useUpdateUserIntro = (userId: number) => {
  const queryClient = useQueryClient();
  const { updateUser, user } = useAuth();

  return useMutation({
    mutationFn: async (intro: string) => {
      const response = await apiClient.put(`/users/${userId}/intro`, { intro });
      return response.data.data; // Return the updated user data
    },
    onSuccess: (updatedUser) => {
      // Lấy dữ liệu hiện tại từ cache hoặc AuthContext
      const currentUserData = queryClient.getQueryData(['userProfile']) || user;
      
      // Merge dữ liệu mới với dữ liệu cũ để giữ lại các field khác
      const mergedUserData = {
        ...currentUserData,
        ...updatedUser,
      };
      
      // Cập nhật cache của user profile
      queryClient.setQueryData(['userProfile'], mergedUserData);
      
      // Cập nhật AuthContext để navbar được cập nhật
      updateUser(mergedUserData as any);
      
      // Invalidate để refetch data mới
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

