"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Eye, EyeOff, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  useCompanyApplications, 
  useUpdateApplicationStatus,
  useToggleApplicationVisibility,
  useHiddenApplications,
  ApplicationStatusMap,
  CompanyApplication,
  CompanyApplicationQueryParams,
  HiddenApplication
} from "@/hooks/useCompanyApplications";
import { useCompanyJobs } from "@/hooks/useCompanyJobs";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { showToast } from "@/utils/toast";

export default function CompanyApplicationsPage() {
  const router = useRouter();
  const { company } = useAuth();
  
  // State cho filters và pagination
  const [queryParams, setQueryParams] = useState<CompanyApplicationQueryParams>({
    page: 1,
    limit: 10,
    sort: 'newest'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  
  // State cho selection
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // State cho hide mode
  const [hideMode, setHideMode] = useState(false);
  
  // Debounce ref cho search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data - conditional based on hideMode
  const { data: applicationsResponse, isLoading: isLoadingApplications, error: applicationsError } = useCompanyApplications({
    ...queryParams,
    enabled: !hideMode
  });
  
  const { data: hiddenApplicationsResponse, isLoading: isLoadingHidden, error: hiddenError } = useHiddenApplications({
    page: queryParams.page,
    limit: queryParams.limit,
    enabled: hideMode
  });
  
  const { data: companyJobs } = useCompanyJobs(company?.id);

  // Determine which data to use based on hideMode
  const isLoading = hideMode ? isLoadingHidden : isLoadingApplications;
  const error = hideMode ? hiddenError : applicationsError;
  const dataResponse = hideMode ? hiddenApplicationsResponse : applicationsResponse;
  
  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus();
  const toggleVisibilityMutation = useToggleApplicationVisibility();

  // Update query params when filters change
  useEffect(() => {
    const newParams: CompanyApplicationQueryParams = {
      page: 1,
      limit: 10,
      sort: selectedSort as 'newest' | 'oldest' | 'status'
    };
    
    if (debouncedSearchTerm.trim()) {
      newParams.search = debouncedSearchTerm.trim();
    }
    
    if (selectedJob && selectedJob !== 'all') {
      newParams.idJob = parseInt(selectedJob);
    }
    
    if (selectedStatus && selectedStatus !== 'all') {
      newParams.status = parseInt(selectedStatus);
    }
    
    setQueryParams(newParams);
  }, [debouncedSearchTerm, selectedJob, selectedStatus, selectedSort]);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set search term immediately for UI responsiveness
    setSearchTerm(value);
    
    // Debounce the actual search (500ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && dataResponse?.data) {
      setSelectedApplications(new Set(dataResponse.data.map(app => app.id)));
    } else {
      setSelectedApplications(new Set());
    }
  };

  // Handle individual selection
  const handleSelectApplication = (applicationId: number, checked: boolean) => {
    const newSelected = new Set(selectedApplications);
    if (checked) {
      newSelected.add(applicationId);
    } else {
      newSelected.delete(applicationId);
      setSelectAll(false);
    }
    setSelectedApplications(newSelected);
  };

  // Handle status change
  const handleStatusChange = (applicationId: number, newStatus: number) => {
    updateStatusMutation.mutate({
      applicationId,
      status: newStatus
    });
  };

  // Handle hide/unhide selected applications
  const handleToggleVisibility = () => {
    if (selectedApplications.size === 0) {
      showToast.warning('Vui lòng chọn ít nhất một đơn ứng tuyển');
      return;
    }

    toggleVisibilityMutation.mutate({
      applicationIds: Array.from(selectedApplications),
      hidden: !hideMode
    });

    setSelectedApplications(new Set());
    setSelectAll(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const applications = dataResponse?.data || [];
  const totalPages = dataResponse?.totalPages || 0;
  const currentPage = dataResponse?.page || 1;
  const total = dataResponse?.total || 0;

  // Helper function to normalize application data
  const normalizeApplication = (app: any) => {
    if (hideMode) {
      // HiddenApplication structure
      return {
        id: app.id,
        name: app.name,
        avatarPic: app.avatarPic,
        status: app.status,
        createdAt: app.createdAt,
        nameJob: app.nameJob,
        email: '', // Hidden applications don't have email
        phone: '', // Hidden applications don't have phone
        idUser: app.idUser, // For navigation to user profile
      };
    } else {
      // CompanyApplication structure
      return {
        id: app.id,
        name: app.name || app.user?.name || 'N/A',
        avatarPic: app.user?.avatar || app.avatarPic,
        status: app.status,
        createdAt: app.createdAt,
        nameJob: app.job?.nameJob || '',
        email: app.email || app.user?.email || '',
        phone: app.phone || app.user?.phone || '',
        idUser: app.idUser, // For navigation to user profile
      };
    }
  };

  // Jobs options for filter
  const jobOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Tất cả' }];
    if (companyJobs) {
      options.push(...companyJobs.map(job => ({
        value: job.id.toString(),
        label: job.nameJob
      })));
    }
    return options;
  }, [companyJobs]);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: '1', label: 'Chưa xem' },
    { value: '2', label: 'Đã xem' },
    { value: '3', label: 'Phỏng vấn' },
    { value: '4', label: 'Từ chối' },
    { value: '5', label: 'Chấp nhận' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'status', label: 'Theo trạng thái' },
  ];

  if (!company) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem trang này</p>
          <Button onClick={() => router.push('/login')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              {/* Left side - Back button */}
              <div className="flex-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/company/profile')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
              </div>
              
              {/* Center - Title */}
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-purple-600">Đơn xin việc đã nhận</h1>
              </div>
              
              {/* Right side - Hide/Show button */}
              <div className="flex-1 flex justify-end">
                <Button 
                  variant={hideMode ? "default" : "outline"}
                  onClick={() => {
                    setHideMode(!hideMode);
                    // Reset selections when switching modes
                    setSelectedApplications(new Set());
                    setSelectAll(false);
                    // Reset to first page
                    setQueryParams(prev => ({ ...prev, page: 1 }));
                  }}
                  className={hideMode ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {hideMode ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Hiện đơn thường
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Xem đơn đã ẩn
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10 h-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearchTerm('');
                        if (searchTimeoutRef.current) {
                          clearTimeout(searchTimeoutRef.current);
                        }
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Job Filter */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Công việc</label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Tất cả công việc">
                      <span className="truncate">
                        {jobOptions.find(opt => opt.value === selectedJob)?.label || 'Tất cả công việc'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {jobOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="truncate">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Trạng thái</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Tất cả trạng thái">
                      <span className="truncate">
                        {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Tất cả trạng thái'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="truncate">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sắp xếp</label>
                <Select value={selectedSort} onValueChange={setSelectedSort}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Mới nhất">
                      <span className="truncate">
                        {sortOptions.find(opt => opt.value === selectedSort)?.label || 'Mới nhất'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="truncate">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select All */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer">
                Chọn tất cả
              </label>
              {selectedApplications.size > 0 && (
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-sm text-gray-600">
                    Đã chọn {selectedApplications.size} đơn
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleVisibility}
                    disabled={toggleVisibilityMutation.isPending}
                  >
                    {hideMode ? 'Hiện đơn đã chọn' : 'Ẩn đơn đã chọn'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Đang tải danh sách ứng tuyển...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">
                  {hideMode ? 'Không có đơn ứng tuyển đã ẩn nào' : 'Không có đơn ứng tuyển nào'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 p-4 text-center text-sm font-medium text-gray-600">STT</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Thông tin</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Nhận vào</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Công việc</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application, index) => {
                    const normalizedApp = normalizeApplication(application);
                    
                    return (
                      <tr 
                        key={application.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => !hideMode && router.push(`/company/applications/${application.id}`)}
                      >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Checkbox
                            checked={selectedApplications.has(application.id)}
                            onCheckedChange={(checked) => handleSelectApplication(application.id, !!checked)}
                          />
                          <span className="text-sm text-gray-600">
                            {String((currentPage - 1) * queryParams.limit! + index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (normalizedApp.idUser) {
                                router.push(`/users/${normalizedApp.idUser}`);
                              }
                            }}
                            title="Xem hồ sơ ứng viên"
                          >
                            <UserAvatar 
                              user={{ 
                                name: normalizedApp.name, 
                                avatarPic: normalizedApp.avatarPic 
                              }} 
                              size="sm"
                              className="w-8 h-8 hover:ring-2 hover:ring-primary/20 transition-all"
                            />
                          </div>
                          <div>
                            <span 
                              className="font-medium text-gray-900 hover:text-primary cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (normalizedApp.idUser) {
                                router.push(`/users/${normalizedApp.idUser}`);
                              }
                            }}
                              title="Xem hồ sơ ứng viên"
                            >
                              {normalizedApp.name}
                            </span>
                            {hideMode && (
                              <p className="text-xs text-red-500 italic">
                                Đơn đã ẩn
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {normalizedApp.nameJob || 'N/A'}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={application.status.toString()}
                          onValueChange={(value) => handleStatusChange(application.id, parseInt(value))}
                          disabled={updateStatusMutation.isPending}
                        >
                           <SelectTrigger className="w-32 h-8">
                             <Badge 
                               className={`text-xs px-2 py-1 ${ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.color || 'bg-gray-100 text-gray-700'}`}
                             >
                               {ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.label || 'Không xác định'}
                             </Badge>
                           </SelectTrigger>
                          <SelectContent>
                            {statusOptions.slice(1).map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <Badge 
                                  className={`text-xs px-2 py-1 ${ApplicationStatusMap[parseInt(status.value) as keyof typeof ApplicationStatusMap]?.color}`}
                                >
                                  {status.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Trang {String(currentPage).padStart(2, '0')} trên {String(totalPages).padStart(2, '0')} (Tổng {total} đơn)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNum = start + i;
                      if (pageNum > end) return null;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
