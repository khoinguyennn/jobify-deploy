import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface ProvinceWithJobCount {
  id: number;
  name: string;
  nameWithType: string;
  jobCount: number;
}

export interface ProvincesByTypeResponse {
  success: boolean;
  data: {
    municipalities: ProvinceWithJobCount[];
    provinces: ProvinceWithJobCount[];
  };
  message: string;
}

export const useProvincesByType = () => {
  return useQuery<ProvincesByTypeResponse>({
    queryKey: ['provincesByType'],
    queryFn: async () => {
      const response = await apiClient.get('/provinces/type');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

