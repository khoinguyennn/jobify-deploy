import { apiClient } from './api';

export interface CVScoringRequest {
  cvFile: File;
  jobId: number;
}

export interface CVScoringResult {
  score: number;
  summary: string;
  suggestions: string[];
  analysis: {
    strengths: string[];
    weaknesses: string[];
    matchingSkills: string[];
    missingSkills: string[];
  };
  jobMatch: {
    jobTitle: string;
    companyName: string;
    requirements: string[];
  };
}

export interface Job {
  id: number;
  nameJob: string;
  company: {
    nameCompany: string;
  };
}

export const cvScoringService = {
  /**
   * Chấm điểm CV với AI
   */
  async scoreCV(request: CVScoringRequest): Promise<CVScoringResult> {
    const formData = new FormData();
    formData.append('cvFile', request.cvFile);
    formData.append('jobId', request.jobId.toString());

    const response = await apiClient.post('/cv-score', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * Demo chấm điểm CV (không cần file)
   */
  async demoScoreCV(jobId: number): Promise<CVScoringResult> {
    const response = await apiClient.post('/cv-score/demo', { jobId });
    return response.data.data;
  },

  /**
   * Tìm kiếm jobs theo tên
   */
  async searchJobs(search: string): Promise<Job[]> {
    const response = await apiClient.get('/jobs', {
      params: {
        search,
        limit: 10,
      },
    });

    return response.data.data.data || [];
  },
};
















