// Constants cho dự án Jobify - Theo CSDL

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/[id]',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/[id]',
  PROFILE: '/profile',
  APPLICATIONS: '/applications',
  SAVED_JOBS: '/saved-jobs',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
} as const;

// Application Status theo database
export const APPLICATION_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  APPLY: 'apply',
  APPROVE: 'approve',
  MESSAGE: 'message',
  FOLLOW: 'follow',
  SYSTEM: 'system',
} as const;

// Gender Options
export const GENDER_OPTIONS = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
  NOT_REQUIRED: 'Không yêu cầu',
} as const;

// Work Types
export const WORK_TYPES = [
  'Toàn thời gian',
  'Bán thời gian',
  'Thực tập',
  'Hợp đồng',
  'Freelance',
  'Remote',
] as const;

// Education Levels
export const EDUCATION_LEVELS = [
  'Không yêu cầu',
  'Trung học phổ thông',
  'Trung cấp',
  'Cao đẳng',
  'Đại học',
  'Thạc sĩ',
  'Tiến sĩ',
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  'Không yêu cầu',
  'Dưới 1 năm',
  '1-2 năm',
  '2-5 năm',
  '5-10 năm',
  'Trên 10 năm',
] as const;

// Company Scales
export const COMPANY_SCALES = [
  'Dưới 50 người',
  '50-100 người',
  '100-500 người',
  '500-1000 người',
  'Trên 1000 người',
] as const;

// TanStack Query Keys
export const QUERY_KEYS = {
  PROVINCES: 'provinces',
  FIELDS: 'fields',
  USERS: 'users',
  USER_DETAIL: 'user-detail',
  COMPANIES: 'companies',
  COMPANY_DETAIL: 'company-detail',
  JOBS: 'jobs',
  JOB_DETAIL: 'job-detail',
  APPLICATIONS: 'applications',
  SAVED_JOBS: 'saved-jobs',
  FOLLOWED_COMPANIES: 'followed-companies',
  NOTIFICATIONS: 'notifications',
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const;

// File Upload Limits
export const FILE_LIMITS = {
  AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  CV_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_CV_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Salary Ranges for Search
export const SALARY_RANGES = [
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: null },
  { label: 'Thỏa thuận', min: null, max: null },
] as const;
