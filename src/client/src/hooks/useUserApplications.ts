import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface UserApplication {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  job: {
    id: number;
    nameJob: string;
    salaryMin?: number;
    salaryMax?: number;
    company: {
      id: number;
      nameCompany: string;
      avatarPic?: string;
    };
    province: {
      id: number;
      nameWithType: string;
    };
  };
}

export const useUserApplications = () => {
  return useQuery({
    queryKey: ['userApplications'],
    queryFn: async (): Promise<UserApplication[]> => {
      const response = await apiClient.get('/applications/my-applications');
      return response.data.data || [];
    },
  });
};
