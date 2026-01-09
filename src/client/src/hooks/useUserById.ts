import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDay?: string;
  sex?: string;
  avatarPic?: string;
  intro?: string;
  linkSocial?: string;
  idProvince?: number;
  provinceName?: string;
  provinceFullName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook để lấy thông tin user theo ID
 */
export const useUserById = (userId: number) => {
  return useQuery<UserProfile>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data.data;
    },
    enabled: !!userId && userId > 0,
  });
};
