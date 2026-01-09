import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface UserProfile {
  id: number;
  name: string;           // Backend field name
  birthDay?: string;      // Backend field name
  sex?: string;           // Backend field name  
  email: string;
  phone?: string;
  idProvince?: number;
  provinceName?: string;  // Tên tỉnh từ backend
  provinceFullName?: string; // Tên đầy đủ tỉnh từ backend
  linkSocial?: string;    // Backend field name
  intro?: string;         // Backend field name
  avatarPic?: string;     // Backend field name
  createdAt?: string;
  updatedAt?: string;
}

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiClient.get('/users/me');
      return response.data.data;
    },
  });
};
