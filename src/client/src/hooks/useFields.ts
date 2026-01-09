import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface Field {
  id: number;
  name: string;
  typeField: string;
}

export interface FieldsResponse {
  success: boolean;
  data: Field[];
  message: string;
}

export const useFields = () => {
  return useQuery<FieldsResponse>({
    queryKey: ['fields'],
    queryFn: async () => {
      const response = await apiClient.get('/fields');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 phút - giảm thời gian cache
    gcTime: 5 * 60 * 1000, // 5 phút - garbage collection
    refetchOnWindowFocus: true, // Refetch khi focus lại window
    refetchOnMount: true, // Refetch khi mount component
  });
};

