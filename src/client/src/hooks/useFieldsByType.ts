import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface FieldWithJobCount {
  id: number;
  name: string;
  typeField: string;
  jobCount: number;
}

export interface FieldsByTypeResponse {
  success: boolean;
  data: Record<string, FieldWithJobCount[]>;
  message: string;
}

export const useFieldsByType = () => {
  return useQuery<FieldsByTypeResponse>({
    queryKey: ['fieldsByType'],
    queryFn: async () => {
      const response = await apiClient.get('/fields/type');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

