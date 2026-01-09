import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Company, CompanySearchParams, PaginatedResponse } from '@/types';
import { QUERY_KEYS } from '@/constants';

// Hook để lấy danh sách companies
export const useCompanies = (params?: CompanySearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANIES, params],
    queryFn: async (): Promise<PaginatedResponse<Company>> => {
      const response = await apiClient.get('/companies', { params });
      return response.data.data; // Backend: { success, data: PaginatedResponse, message }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

// Hook để lấy chi tiết company
export const useCompanyDetail = (companyId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANY_DETAIL, companyId],
    queryFn: async (): Promise<Company> => {
      const response = await apiClient.get(`/companies/${companyId}`);
      return response.data.data; // Backend wraps response in { success, data, message }
    },
    enabled: !!companyId,
  });
};

// Hook để follow company
export const useFollowCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiClient.post('/follow-companies', { idCompany: companyId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES] });
    },
  });
};

// Hook để unfollow company
export const useUnfollowCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiClient.delete(`/follow-companies/${companyId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES] });
    },
  });
};

// Hook để lấy danh sách companies mà user đang follow
export const useFollowedCompanies = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES],
    queryFn: async (): Promise<Company[]> => {
      const response = await apiClient.get('/follow-companies');
      return response.data.data; // Backend wraps response in { success, data, message }
    },
  });
};
