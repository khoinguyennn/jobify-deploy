import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface Province {
  id: number;
  name: string;
  nameWithType: string;
}

export interface ProvincesResponse {
  success: boolean;
  data: Province[];
  message: string;
}

export const useProvinces = () => {
  return useQuery<ProvincesResponse>({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await apiClient.get('/provinces');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 phút - giảm thời gian cache
    gcTime: 5 * 60 * 1000, // 5 phút - garbage collection
    refetchOnWindowFocus: true, // Refetch khi focus lại window
    refetchOnMount: true, // Refetch khi mount component
  });
};

