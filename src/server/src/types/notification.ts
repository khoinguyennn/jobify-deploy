export interface Notification {
  id: number;
  idUser?: number;
  idCompany?: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job_application' | 'job_status_update' | 'new_job_match';
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationDTO {
  idUser?: number;
  idCompany?: number;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job_application' | 'job_status_update' | 'new_job_match';
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}
































