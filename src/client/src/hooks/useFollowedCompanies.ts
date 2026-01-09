import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';
import { Company } from '@/types';

// Query Keys
const QUERY_KEYS = {
  FOLLOWED_COMPANIES: 'followed-companies',
  FOLLOW_COMPANY_CHECK: 'follow-company-check',
} as const;

// Lấy danh sách công ty đã theo dõi
export const useFollowedCompanies = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES],
    queryFn: async (): Promise<any[]> => {
      const response = await apiClient.get('/followed-companies');
      // API trả về PaginatedResponse với cấu trúc: { success, data: { data: [], total, page... } }
      return response.data.data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};

// Kiểm tra trạng thái theo dõi của một công ty
export const useFollowCompanyCheck = (companyId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOW_COMPANY_CHECK, companyId],
    queryFn: async (): Promise<{ isFollowed: boolean }> => {
      if (!companyId) throw new Error('Company ID is required');
      const response = await apiClient.get(`/followed-companies/check/${companyId}`);
      return response.data.data;
    },
    enabled: !!companyId, // Chỉ chạy khi có companyId
    staleTime: 30 * 1000, // 30 giây
    gcTime: 2 * 60 * 1000, // 2 phút
  });
};

// Theo dõi công ty
export const useFollowCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiClient.post('/followed-companies', { idCompany: companyId });
      return response.data;
    },
    onSuccess: (data, companyId) => {
      // Cập nhật cache cho danh sách followed companies
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES] 
      });
      
      // Cập nhật cache cho count
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'count']
      });
      
      // Cập nhật cache cho follower count của company
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'company-follower-count', companyId]
      });
      
      // Cập nhật cache cho kiểm tra trạng thái company cụ thể
      queryClient.setQueryData(
        [QUERY_KEYS.FOLLOW_COMPANY_CHECK, companyId],
        { isFollowed: true }
      );
      
      showToast.success('Đã theo dõi công ty!');
    },
    onError: (error: any) => {
      console.error('Error following company:', error);
      showToast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi theo dõi công ty'
      );
    },
  });
};

// Hủy theo dõi công ty
export const useUnfollowCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: number) => {
      const response = await apiClient.delete(`/followed-companies/${companyId}`);
      return response.data;
    },
    onSuccess: (data, companyId) => {
      // Cập nhật cache cho danh sách followed companies
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES] 
      });
      
      // Cập nhật cache cho count
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'count']
      });
      
      // Cập nhật cache cho follower count của company
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'company-follower-count', companyId]
      });
      
      // Cập nhật cache cho kiểm tra trạng thái company cụ thể
      queryClient.setQueryData(
        [QUERY_KEYS.FOLLOW_COMPANY_CHECK, companyId],
        { isFollowed: false }
      );
      
      showToast.success('Đã hủy theo dõi công ty!');
    },
    onError: (error: any) => {
      console.error('Error unfollowing company:', error);
      showToast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi hủy theo dõi công ty'
      );
    },
  });
};

// Hook tổng hợp để toggle follow/unfollow company
export const useToggleFollowCompany = () => {
  const followCompanyMutation = useFollowCompany();
  const unfollowCompanyMutation = useUnfollowCompany();

  const toggleFollowCompany = async (companyId: number, currentlyFollowed: boolean) => {
    try {
      if (currentlyFollowed) {
        await unfollowCompanyMutation.mutateAsync(companyId);
      } else {
        await followCompanyMutation.mutateAsync(companyId);
      }
    } catch (error) {
      // Error handling đã được xử lý trong từng mutation
    }
  };

  return {
    toggleFollowCompany,
    isLoading: followCompanyMutation.isPending || unfollowCompanyMutation.isPending,
  };
};

// Lấy số lượng công ty đã theo dõi
export const useFollowedCompaniesCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'count'],
    queryFn: async (): Promise<{ count: number }> => {
      const response = await apiClient.get('/followed-companies/count');
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 3 * 60 * 1000, // 3 phút
  });
};

// Hook để lấy multiple company check states (cho danh sách companies)
export const useMultipleFollowedCompaniesCheck = (companyIds: number[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOW_COMPANY_CHECK, 'multiple', companyIds.sort()],
    queryFn: async (): Promise<Record<number, boolean>> => {
      // Tạo map để lưu kết quả
      const results: Record<number, boolean> = {};
      
      // Kiểm tra từng company song song
      const promises = companyIds.map(async (companyId) => {
        try {
          const response = await apiClient.get(`/followed-companies/check/${companyId}`);
          results[companyId] = response.data.data.isFollowed;
        } catch (error) {
          // Nếu lỗi, mặc định là chưa theo dõi
          results[companyId] = false;
        }
      });
      
      await Promise.all(promises);
      return results;
    },
    enabled: companyIds.length > 0,
    staleTime: 30 * 1000, // 30 giây
    gcTime: 2 * 60 * 1000, // 2 phút
  });
};

// Lấy số lượng người theo dõi của một công ty
export const useCompanyFollowerCount = (companyId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLLOWED_COMPANIES, 'company-follower-count', companyId],
    queryFn: async (): Promise<{ count: number }> => {
      if (!companyId) throw new Error('Company ID is required');
      const response = await apiClient.get(`/followed-companies/company/${companyId}/count`);
      return response.data.data;
    },
    enabled: !!companyId, // Chỉ chạy khi có companyId
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};