import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface CompanyJob {
  id: number;
  idCompany: number;
  idField: number;
  idProvince: number;
  nameJob: string;
  request: string;
  desc: string;
  other: string;
  salaryMin?: number;
  salaryMax?: number;
  sex: string;
  typeWork: string;
  education: string;
  experience: string;
  createdAt: string;
  deletedAt?: string | null;
  // Thông tin liên kết từ API
  company: {
    id: number;
    nameCompany: string;
    avatarPic: string;
    scale: string;
    web: string;
  };
  field: {
    id: number;
    name: string;
    typeField: string;
  };
  province: {
    id: number;
    name: string;
    nameWithType: string;
  };
  appliedCount: number;
}

export const useCompanyJobs = (companyId: number | undefined) => {
  return useQuery({
    queryKey: ['company-jobs', companyId],
    queryFn: async (): Promise<CompanyJob[]> => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      const response = await apiClient.get(`/companies/${companyId}/jobs`);
      console.log('Company jobs API response:', response.data);
      
      // API trả về { success: true, data: { data: [...], total, page, limit, totalPages } }
      return response.data.data?.data || [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
