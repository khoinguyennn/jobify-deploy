// Types cho dự án Jobify - Dựa theo CSDL

// ===== CORE ENTITIES =====

export interface Province {
  id: number;
  name: string;
  nameWithType: string;
}

export interface Field {
  id: number;
  name: string;
  typeField: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  idProvince: number;
  phone: string;
  avatarPic?: string;
  birthDay?: string;
  intro?: string;
  linkSocial?: string;
  sex?: 'Nam' | 'Nữ' | 'Khác';
  // Relations
  province?: Province;
}

export interface Company {
  id: number;
  nameCompany: string;
  nameAdmin: string;
  email: string;
  password: string;
  avatarPic?: string;
  phone: string;
  idProvince: number;
  intro?: string;
  scale?: string;
  web?: string;
  // Additional fields from API response
  provinceName?: string;
  provinceFullName?: string;
  jobCount?: number;
  // Relations
  province?: Province;
}

export interface Job {
  id: number;
  idCompany: number;
  idField: number;
  idProvince: number;
  nameJob: string;
  request: string;
  desc: string;
  other?: string;
  salaryMin?: number;
  salaryMax?: number;
  sex?: 'Nam' | 'Nữ' | 'Không yêu cầu';
  typeWork: string;
  education: string;
  experience: string;
  createdAt: string;
  deletedAt?: string;
  // Relations
  company?: Company;
  field?: Field;
  province?: Province;
}

export interface ApplyJob {
  id: number;
  idUser: number;
  idJob: number;
  name: string;
  email: string;
  phone: string;
  status: number; // 0: pending, 1: approved, 2: rejected
  letter?: string;
  cv?: string;
  createdAt: string;
  deletedAt?: string;
  // Relations
  user?: User;
  job?: Job;
}

export interface SaveJob {
  id: number;
  idUser: number;
  idJob: number;
  createdAt: string;
  // Relations
  user?: User;
  job?: Job;
}

export interface FollowCompany {
  id: number;
  idUser: number;
  idCompany: number;
  createdAt: string;
  // Relations
  user?: User;
  company?: Company;
}

export interface Notification {
  id: number;
  idUser?: number;
  idCompany?: number;
  title: string;
  content: string;
  type: 'apply' | 'approve' | 'message' | 'follow' | 'system';
  isRead: boolean;
  createdAt: string;
  // Relations
  user?: User;
  company?: Company;
}

// ===== ENUMS & CONSTANTS =====

export enum ApplicationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

export enum NotificationType {
  APPLY = 'apply',
  APPROVE = 'approve',
  MESSAGE = 'message',
  FOLLOW = 'follow',
  SYSTEM = 'system'
}

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
  OTHER = 'Khác',
  NOT_REQUIRED = 'Không yêu cầu'
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== FORM TYPES =====

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  idProvince: number;
  phone: string;
  avatarPic?: string;
  birthDay?: string;
  intro?: string;
  linkSocial?: string;
  sex?: Gender;
}

export interface CompanyFormData {
  nameCompany: string;
  nameAdmin: string;
  email: string;
  password?: string;
  phone: string;
  idProvince: number;
  intro?: string;
  scale?: string;
  web?: string;
  avatarPic?: string;
}

export interface JobFormData {
  idCompany: number;
  idField: number;
  idProvince: number;
  nameJob: string;
  request: string;
  desc: string;
  other?: string;
  salaryMin?: number;
  salaryMax?: number;
  sex?: Gender;
  typeWork: string;
  education: string;
  experience: string;
}

export interface ApplyJobFormData {
  idJob: number;
  name: string;
  email: string;
  phone: string;
  letter?: string;
  cv?: File;
}

// ===== SEARCH & FILTER TYPES =====

export interface JobSearchParams extends PaginationParams {
  idField?: number;
  idProvince?: number;
  salaryMin?: number;
  salaryMax?: number;
  typeWork?: string;
  experience?: string;
  education?: string;
}

export interface CompanySearchParams extends PaginationParams {
  keyword?: string;
  province?: number;
  scale?: string;
}
