import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';

// Interface cho application theo format mới từ API GET /apply
export interface Application {
  id: number;
  idJob: number;
  nameJob: string;
  salaryMax?: number;
  salaryMin?: number;
  typeWork: string;
  idCompany: number;
  province: string;
  nameCompany: string;
  avatarPic?: string;
  nameFields: string;
  createdAt: string;
  status: number;
}

// Response interface cho pagination
export interface ApplicationsResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters cho API
export interface ApplicationQueryParams {
  page?: number;
  limit?: number;
}

/**
 * Hook để lấy danh sách ứng tuyển của user
 * Sử dụng API GET /apply
 */
export const useApplications = (params: ApplicationQueryParams = {}) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async (): Promise<ApplicationsResponse> => {
      const queryString = new URLSearchParams();
      
      if (params.page) queryString.append('page', params.page.toString());
      if (params.limit) queryString.append('limit', params.limit.toString());
      
      const url = `/apply${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook để hủy ứng tuyển
 * Sử dụng API DELETE /apply/{idJob}
 */
export const useCancelApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (idJob: number): Promise<void> => {
      await apiClient.delete(`/apply/${idJob}`);
    },
    onSuccess: (_, idJob) => {
      // Invalidate và refetch danh sách applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-status', idJob] });
      
      showToast.success('Đã hủy ứng tuyển thành công!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi hủy ứng tuyển';
      
      showToast.error(errorMessage);
    }
  });
};

/**
 * Interface cho dữ liệu ứng tuyển
 */
export interface ApplyJobData {
  idJob: number;
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  cv?: File;
}

/**
 * Hook để ứng tuyển công việc
 * Sử dụng API POST /apply
 */
export const useApplyJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ApplyJobData): Promise<void> => {
      const formData = new FormData();
      formData.append('idJob', data.idJob.toString());
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('letter', data.coverLetter); // Backend expects 'letter' field
      
      if (data.cv) {
        formData.append('cv', data.cv);
      }
      
      await apiClient.post('/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate các queries liên quan
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applicationsCount'] });
      queryClient.invalidateQueries({ queryKey: ['application-status', variables.idJob] });
      
      showToast.success('Ứng tuyển thành công!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển';
      showToast.error(errorMessage);
    }
  });
};

/**
 * Hook để lấy tổng số ứng tuyển (cho hiển thị ở header)
 */
export const useApplicationsCount = () => {
  return useQuery({
    queryKey: ['applicationsCount'],
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get('/apply?limit=1&page=1');
      return response.data.data.total || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook để kiểm tra trạng thái ứng tuyển cho một job
 * Sử dụng API GET /apply/status/{idJob}
 */
export const useApplicationStatus = (idJob: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['application-status', idJob],
    queryFn: async (): Promise<{ hasApplied: boolean }> => {
      const response = await apiClient.get(`/apply/status/${idJob}`);
      return response.data.data;
    },
    enabled: enabled && !!idJob, // Chỉ chạy khi có idJob và enabled
  });
};