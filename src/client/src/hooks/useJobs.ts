import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Job as JobType } from '@/types';

// Extend Job type from @/types with additional alias properties
export interface Job extends JobType {
  // Alias properties for backward compatibility
  title?: string; // Alias for nameJob
  fieldId?: number; // Alias for idField
  provinceId?: number; // Alias for idProvince
  gender?: string; // Alias for sex
  workingType?: string; // Alias for typeWork
  description?: string; // Alias for desc
  requirement?: string; // Alias for request
  benefit?: string; // Alias for other
  skills?: string; // New field for skills
  companyId?: number; // Alias for idCompany
  nameCompany?: string; // Company name directly
  updatedAt?: string;
}

export interface CreateJobData {
  nameJob: string;
  idField: number;
  idProvince: number;
  sex?: string;
  salaryMin?: number;
  salaryMax?: number;
  typeWork?: string;
  education?: string;
  experience?: string;
  desc: string;
  request: string;
  other?: string;
}

// Hook để tạo job mới
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobData: CreateJobData) => {
      const response = await apiClient.post('/jobs', jobData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate và refetch jobs list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    },
  });
}

// Hook để lấy danh sách jobs của company
export function useCompanyJobs() {
  return useQuery({
    queryKey: ['company-jobs'],
    queryFn: async () => {
      const response = await apiClient.get('/companies/me/jobs');
      return response.data.data as Job[];
    },
  });
}

// Hook để lấy danh sách tất cả jobs (public)
export function useJobs(params?: {
  page?: number;
  limit?: number;
  idField?: number;
  idProvince?: number;
  negotiable?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  typeWork?: string;
  education?: string;
  experience?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const response = await apiClient.get('/jobs', { params });
      return response.data;
    },
  });
}

// Hook để lấy chi tiết job
export function useJob(id: number) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data.data as Job;
    },
    enabled: !!id,
  });
}

// Hook để cập nhật job
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateJobData> }) => {
      const response = await apiClient.put(`/jobs/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Cập nhật cache
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
    },
  });
}

// Hook để xóa job (hard delete)
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    },
  });
}

// Hook để ẩn job (soft delete)
export function useHideJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.put(`/jobs/${id}/hidden`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    },
  });
}

// Hook để khôi phục job
export function useUnhideJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.put(`/jobs/${id}/unhidden`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    },
  });
}