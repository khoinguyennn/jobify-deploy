import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';

// Interface cho company application với thông tin chi tiết
export interface CompanyApplication {
  id: number;
  idJob: number;
  idUser: number;
  name: string;
  email: string;
  phone: string;
  letter?: string;
  cv?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  // Thông tin job
  job: {
    id: number;
    nameJob: string;
    salaryMin?: number;
    salaryMax?: number;
    typeWork: string;
    idCompany: number;
  };
  // Thông tin user
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

// Response interface cho pagination
export interface CompanyApplicationsResponse {
  data: CompanyApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters cho API
export interface CompanyApplicationQueryParams {
  page?: number;
  limit?: number;
  idJob?: number;
  status?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'status';
}

/**
 * Hook để lấy danh sách ứng tuyển của công ty
 * Sử dụng API GET /apply/company
 */
export const useCompanyApplications = (params: CompanyApplicationQueryParams & { enabled?: boolean } = {}) => {
  const { enabled = true, ...queryParams } = params;
  
  return useQuery({
    queryKey: ['company-applications', queryParams],
    queryFn: async (): Promise<CompanyApplicationsResponse> => {
      const queryString = new URLSearchParams();
      
      if (queryParams.page) queryString.append('page', queryParams.page.toString());
      if (queryParams.limit) queryString.append('limit', queryParams.limit.toString());
      if (queryParams.idJob) queryString.append('idJob', queryParams.idJob.toString());
      if (queryParams.status) queryString.append('status', queryParams.status.toString());
      if (queryParams.search) queryString.append('search', queryParams.search);
      if (queryParams.sort) queryString.append('sort', queryParams.sort);
      
      const url = `/apply/company${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      return response.data.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook để cập nhật trạng thái ứng tuyển
 * Sử dụng API PUT /apply/:id/status
 */
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status 
    }: { 
      applicationId: number; 
      status: number;
    }) => {
      const response = await apiClient.put(`/apply/${applicationId}/status`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate và refetch company applications queries
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-detail'] });
      
      showToast.success('Cập nhật trạng thái thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      showToast.error(message);
    },
  });
};

/**
 * Hook để ẩn/hiện đơn ứng tuyển  
 * Sử dụng API PUT /apply/hidden và PUT /apply/unHidden
 */
export const useToggleApplicationVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      applicationIds, 
      hidden 
    }: { 
      applicationIds: number[]; 
      hidden: boolean;
    }) => {
      const endpoint = hidden ? '/apply/hidden' : '/apply/unHidden';
      
      // Gọi API cho từng application ID
      const promises = applicationIds.map(id => 
        apiClient.put(endpoint, { id })
      );
      
      const responses = await Promise.all(promises);
      return responses.map(response => response.data);
    },
    onSuccess: (data, variables) => {
      // Invalidate và refetch company applications queries
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['hidden-applications'] });
      
      const action = variables.hidden ? 'ẩn' : 'hiện';
      const count = variables.applicationIds.length;
      showToast.success(`Đã ${action} ${count} đơn ứng tuyển được chọn!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái hiển thị';
      showToast.error(message);
    },
  });
};

// Status mapping cho display
export const ApplicationStatusMap = {
  1: { label: 'Chưa xem', color: 'bg-gray-100 text-gray-700' },
  2: { label: 'Đã xem', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Phỏng vấn', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  5: { label: 'Chấp nhận', color: 'bg-green-100 text-green-700' },
} as const;

export type ApplicationStatus = keyof typeof ApplicationStatusMap;

// Interface cho hidden application (cấu trúc đơn giản hơn)
export interface HiddenApplication {
  id: number;
  idUser: number;
  name: string;
  status: number;
  createdAt: string;
  nameJob: string;
  avatarPic?: string;
}

// Response interface cho hidden applications
export interface HiddenApplicationsResponse {
  data: HiddenApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook để lấy danh sách đơn ứng tuyển đã ẩn
 * Sử dụng API GET /apply/userHideApply
 */
export const useHiddenApplications = (params: { page?: number; limit?: number; enabled?: boolean }) => {
  const { page = 1, limit = 10, enabled = true } = params;

  return useQuery({
    queryKey: ['hidden-applications', { page, limit }],
    queryFn: async (): Promise<HiddenApplicationsResponse> => {
      const response = await apiClient.get('/apply/userHideApply', {
        params: { page, limit }
      });
      return response.data.data;
    },
    enabled,
    staleTime: 30000, // 30 seconds
  });
};





