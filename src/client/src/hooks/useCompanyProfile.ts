import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface CompanyProfile {
  id: number;
  nameCompany: string;
  nameAdmin: string;
  email: string;
  phone: string;
  web?: string;
  avatarPic?: string;
  intro?: string;
  idProvince: number;
  scale?: string;
  provinceName?: string;
  provinceFullName?: string;
  createdAt: string;
  updatedAt: string;
}

const QUERY_KEYS = {
  COMPANY_PROFILE: 'company-profile',
};

export const useCompanyProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMPANY_PROFILE],
    queryFn: async (): Promise<CompanyProfile> => {
      const response = await apiClient.get('/companies/me');
      return response.data.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
