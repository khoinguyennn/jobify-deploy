import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';
import { Job } from '@/types';

// Query Keys
const QUERY_KEYS = {
  SAVED_JOBS: 'saved-jobs',
  SAVED_JOB_CHECK: 'saved-job-check',
} as const;

// Lấy danh sách công việc đã lưu  
export const useSavedJobs = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SAVED_JOBS],
    queryFn: async (): Promise<any[]> => {
      const response = await apiClient.get('/saved-jobs');
      // API trả về PaginatedResponse với cấu trúc: { success, data: { data: [], total, page... } }
      return response.data.data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};

// Kiểm tra trạng thái lưu của một công việc
export const useSavedJobCheck = (jobId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SAVED_JOB_CHECK, jobId],
    queryFn: async (): Promise<{ isSaved: boolean }> => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await apiClient.get(`/saved-jobs/check/${jobId}`);
      return response.data.data;
    },
    enabled: !!jobId, // Chỉ chạy khi có jobId
    staleTime: 30 * 1000, // 30 giây
    gcTime: 2 * 60 * 1000, // 2 phút
  });
};

// Lưu công việc
export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiClient.post('/saved-jobs', { idJob: jobId });
      return response.data;
    },
    onSuccess: (data, jobId) => {
      // Cập nhật cache cho danh sách saved jobs
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.SAVED_JOBS] 
      });
      
      // Cập nhật cache cho count
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAVED_JOBS, 'count']
      });
      
      // Cập nhật cache cho kiểm tra trạng thái job cụ thể
      queryClient.setQueryData(
        [QUERY_KEYS.SAVED_JOB_CHECK, jobId],
        { isSaved: true }
      );
      
      showToast.success('Đã lưu công việc!');
    },
    onError: (error: any) => {
      console.error('Error saving job:', error);
      showToast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi lưu công việc'
      );
    },
  });
};

// Hủy lưu công việc
export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiClient.delete(`/saved-jobs/${jobId}`);
      return response.data;
    },
    onSuccess: (data, jobId) => {
      // Cập nhật cache cho danh sách saved jobs
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.SAVED_JOBS] 
      });
      
      // Cập nhật cache cho count
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SAVED_JOBS, 'count']
      });
      
      // Cập nhật cache cho kiểm tra trạng thái job cụ thể
      queryClient.setQueryData(
        [QUERY_KEYS.SAVED_JOB_CHECK, jobId],
        { isSaved: false }
      );
      
      showToast.success('Đã hủy lưu công việc!');
    },
    onError: (error: any) => {
      console.error('Error unsaving job:', error);
      showToast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi hủy lưu công việc'
      );
    },
  });
};

// Hook tổng hợp để toggle save/unsave job
export const useToggleSaveJob = () => {
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();
  const queryClient = useQueryClient();

  const toggleSaveJob = async (jobId: number, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await unsaveJobMutation.mutateAsync(jobId);
      } else {
        await saveJobMutation.mutateAsync(jobId);
      }
    } catch (error) {
      // Error handling đã được xử lý trong từng mutation
    }
  };

  return {
    toggleSaveJob,
    isLoading: saveJobMutation.isPending || unsaveJobMutation.isPending,
  };
};

// Lấy số lượng công việc đã lưu
export const useSavedJobsCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SAVED_JOBS, 'count'],
    queryFn: async (): Promise<{ count: number }> => {
      const response = await apiClient.get('/saved-jobs/count');
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 3 * 60 * 1000, // 3 phút
  });
};

// Hook để lấy multiple job check states (cho danh sách jobs)
export const useMultipleSavedJobsCheck = (jobIds: number[]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEYS.SAVED_JOB_CHECK, 'multiple', jobIds.sort()],
    queryFn: async (): Promise<Record<number, boolean>> => {
      // Tạo map để lưu kết quả
      const results: Record<number, boolean> = {};
      
      // Kiểm tra từng job song song
      const promises = jobIds.map(async (jobId) => {
        try {
          const response = await apiClient.get(`/saved-jobs/check/${jobId}`);
          results[jobId] = response.data.data.isSaved;
        } catch (error) {
          // Nếu lỗi, mặc định là chưa lưu
          results[jobId] = false;
        }
      });
      
      await Promise.all(promises);
      return results;
    },
    enabled: jobIds.length > 0,
    staleTime: 30 * 1000, // 30 giây
    gcTime: 2 * 60 * 1000, // 2 phút
  });
};