import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export interface UpdateUserProfileData {
  name?: string;           // Backend field name
  phone?: string;
  linkSocial?: string;     // Backend field name for facebook
  birthDay?: string;       // Backend field name, YYYY-MM-DD format
  sex?: 'Nam' | 'Nữ' | 'Khác';  // Backend field name for gender
  email?: string;
  idProvince?: number;
}

export const useUpdateUserProfile = (userId: number) => {
  const queryClient = useQueryClient();
  const { updateUser, user } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileData) => {
      const response = await apiClient.put(`/users/${userId}`, data);
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
