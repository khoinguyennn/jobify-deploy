import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateCompanyIntroRequest {
  intro: string;
}

interface UpdateCompanyIntroResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    intro: string;
  };
}

export const useUpdateCompanyIntro = () => {
  const queryClient = useQueryClient();
  const { company, updateCompany } = useAuth();

  return useMutation({
    mutationFn: async ({ id, intro }: { id: number; intro: string }): Promise<UpdateCompanyIntroResponse> => {
      const response = await apiClient.put(`/companies/${id}/intro`, { intro });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Sử dụng intro từ variables thay vì từ response
      const introContent = data?.data?.intro || variables.intro;
      
      // Cập nhật cache của company profile
      const currentCompanyData = queryClient.getQueryData(['company-profile']) || company;
      const updatedCompanyData = {
        ...currentCompanyData,
        intro: introContent,
      };

      // Cập nhật cache
      queryClient.setQueryData(['company-profile'], updatedCompanyData);
      
      // Cập nhật AuthContext
      if (company) {
        updateCompany({
          ...company,
          intro: introContent,
        });
      }

      // Invalidate queries để đảm bảo data fresh
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });

      showToast.success(data?.message || 'Cập nhật giới thiệu công ty thành công!');
    },
    onError: (error: any) => {
      console.error('Update company intro error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Có lỗi xảy ra khi cập nhật giới thiệu công ty!';
      showToast.error(errorMessage);
    },
  });
};
