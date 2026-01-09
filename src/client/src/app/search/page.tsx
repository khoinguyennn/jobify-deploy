"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, DollarSign, Clock, GraduationCap, Users, ChevronDown, Building, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useJobs } from "@/hooks/useJobs";
import { useProvinces } from "@/hooks/useProvinces";
import { useFields } from "@/hooks/useFields";
import { SavedJobButton } from "@/components/SavedJobButton";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicationStatus } from "@/hooks/useApplications";
import { showToast } from "@/utils/toast";
import { Job } from "@/types";

// Utility function to format salary
const formatSalary = (salaryMin?: number, salaryMax?: number): string => {
  if (!salaryMin && !salaryMax) return "Thỏa thuận";
  if (salaryMin && salaryMax) {
    return `${salaryMin} - ${salaryMax} triệu`;
  }
  if (salaryMin) return `Từ ${salaryMin} triệu`;
  if (salaryMax) return `Đến ${salaryMax} triệu`;
  return "Thỏa thuận";
};

// Utility function to format time ago (similar to company profile)
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

// Component để handle nút ứng tuyển với kiểm tra trạng thái
const ApplyButton: React.FC<{ jobId: number }> = ({ jobId }) => {
  const router = useRouter();
  const { isAuthenticated, userType, isLoading: authLoading, user, company, refreshUser } = useAuth();

  // Centralized localStorage checks với useMemo
  const { token, storedUserType, isActuallyAuthenticated, actualUserType } = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
    const isActuallyAuthenticated = isAuthenticated || !!(token && storedUserType);
    const actualUserType = userType || storedUserType;
    
    return { token, storedUserType, isActuallyAuthenticated, actualUserType };
  }, [isAuthenticated, userType]);
  
  
  const shouldQueryStatus = !authLoading && isActuallyAuthenticated && actualUserType === 'user';

  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(
    jobId,
    shouldQueryStatus
  );

  // Auto refresh auth nếu cần
  useEffect(() => {
    if (!authLoading && !isAuthenticated && token && storedUserType) {
      refreshUser();
    }
  }, [authLoading, isAuthenticated, token, storedUserType, refreshUser]);

  // Không render button khi auth đang loading
  if (authLoading) {
    return (
      <Button size="sm" disabled className="bg-gray-300">
        Đang tải...
      </Button>
    );
  }

  // Xử lý click cho company user
  const handleCompanyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast.warning('Chỉ ứng viên mới có thể ứng tuyển');
  };

  // Hiển thị button giống hệt user nhưng khác xử lý
  if (isActuallyAuthenticated && actualUserType !== 'user') {
    return (
      <Button 
        size="sm" 
        className="bg-primary hover:bg-primary/90"
        onClick={handleCompanyClick}
      >
        Ứng tuyển
      </Button>
    );
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (statusLoading || authLoading) return;

    if (applicationStatus?.hasApplied === true) {
      showToast.info('Bạn đã ứng tuyển công việc này rồi');
      return;
    }

    if (!isActuallyAuthenticated) {
      showToast.warning('Vui lòng đăng nhập để ứng tuyển');
      return;
    }

    if (actualUserType !== 'user') {
      showToast.warning('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }

    router.push(`/jobs/${jobId}?apply=true`);
  };

  return (
    <Button 
      size="sm" 
      className={`${applicationStatus?.hasApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
      onClick={handleApplyClick}
      disabled={statusLoading || authLoading || applicationStatus?.hasApplied}
    >
      {authLoading ? 'Đang tải...' :
       statusLoading ? 'Đang kiểm tra...' : 
       applicationStatus?.hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
    </Button>
  );
};

export default function TimKiemPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // Query thực tế được gửi đi
  const [hasSearched, setHasSearched] = useState(false); // Theo dõi xem đã search chưa
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedEducation, setSelectedEducation] = useState("");
  const [salaryRange, setSalaryRange] = useState([1, 50]);
  const [showSalaryRange, setShowSalaryRange] = useState(false);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);

  // Fetch data using hooks
  const { data: provincesResponse, isLoading: isLoadingProvinces } = useProvinces();
  const { data: fieldsResponse, isLoading: isLoadingFields } = useFields();
  
  const provinces = provincesResponse?.data || [];
  const fields = fieldsResponse?.data || [];
  
  // Build search parameters - luôn load jobs, kể cả khi chưa search
  const searchParamsForAPI = {
    page: currentPage,
    limit: jobsPerPage,
    // Chỉ thêm search khi đã thực hiện tìm kiếm và có activeSearchQuery
    ...(hasSearched && activeSearchQuery && { search: activeSearchQuery }),
    ...(selectedField && selectedField !== "all" && { idField: parseInt(selectedField) }),
    ...(selectedProvince && selectedProvince !== "all" && { idProvince: parseInt(selectedProvince) }),
    ...(selectedJobType && selectedJobType !== "all" && { typeWork: selectedJobType }),
    ...(selectedExperience && selectedExperience !== "all" && { experience: selectedExperience }),
    ...(selectedEducation && selectedEducation !== "all" && { education: selectedEducation }),
    ...(isNegotiable && { negotiable: true }),
    ...(!isNegotiable && salaryRange[0] > 1 && { salaryMin: salaryRange[0] }),
    ...(!isNegotiable && salaryRange[1] < 50 && { salaryMax: salaryRange[1] }),
    ...(sortBy && sortBy !== "newest" && { 
      sortBy: sortBy === "salary-high" || sortBy === "salary-low" ? "salary" : 
             sortBy === "company" ? "company" : "createdAt",
      sortOrder: sortBy === "salary-high" ? "DESC" : 
                sortBy === "salary-low" ? "ASC" : 
                sortBy === "company" ? "ASC" : "DESC"
    }),
  };

  const { data: jobsResponse, isLoading: isLoadingJobs } = useJobs(searchParamsForAPI);

  // Handle URL parameters on component mount
  useEffect(() => {
    const urlSearchQuery = searchParams.get('q');
    const urlLocation = searchParams.get('location');
    const urlField = searchParams.get('field');
    
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
      setActiveSearchQuery(urlSearchQuery);
      setHasSearched(true);
    }
    
    if (urlLocation && urlLocation !== 'all') {
      setSelectedProvince(urlLocation);
    }
    
    if (urlField && urlField !== 'all') {
      setSelectedField(urlField);
    }
  }, [searchParams]);

  // Debug: Log search params to console (remove in production)
  console.log('API Search params:', searchParamsForAPI);

  // Handle filter changes to reset pagination
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filter changes
    
    switch (filterType) {
      case 'province':
        setSelectedProvince(value);
        break;
      case 'field':
        setSelectedField(value);
        break;
      case 'jobType':
        setSelectedJobType(value);
        break;
      case 'experience':
        setSelectedExperience(value);
        break;
      case 'education':
        setSelectedEducation(value);
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveSearchQuery(""); // Cũng clear activeSearchQuery
    setHasSearched(false); // Reset trạng thái tìm kiếm
    setSelectedProvince("");
    setSelectedField("");
    setSelectedJobType("");
    setSelectedExperience("");
    setSelectedEducation("");
    setSalaryRange([1, 50]);
    setIsNegotiable(false);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = (hasSearched && activeSearchQuery) || // Chỉ hiển thị search filter khi đã search
    (selectedProvince && selectedProvince !== "all") || 
    (selectedField && selectedField !== "all") || 
    (selectedJobType && selectedJobType !== "all") || 
    (selectedExperience && selectedExperience !== "all") || 
    (selectedEducation && selectedEducation !== "all") ||
    isNegotiable ||
    (!isNegotiable && (salaryRange[0] !== 1 || salaryRange[1] !== 50));

  // Job types options
  const jobTypes = [
    "Nhân viên chính thức",
    "Bán thời gian", 
    "Tự do",
    "Thực tập"
  ];

  // Experience options
  const experienceOptions = [
    "Không yêu cầu",
    "1 năm",
    "1 - 2 năm",
    "2 - 5 năm", 
    "5 - 10 năm",
    "Trên 10 năm"
  ];

  // Education options
  const educationOptions = [
    "Không yêu cầu",
    "Tốt nghiệp THPT",
    "Trung cấp",
    "Cao đẳng",
    "Đại học",
    "Thạc sĩ",
    "Tiến sĩ"
  ];

  // Get jobs data from API response
  // API trả về: { success: true, data: { data: [...], total: X, page: Y, limit: Z }, message: "..." }
  const jobs = jobsResponse?.data?.data || [];
  const totalJobs = jobsResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  

  const handleSearch = () => {
    // Cập nhật activeSearchQuery để trigger API call
    setActiveSearchQuery(searchQuery);
    setHasSearched(true); // Đánh dấu đã thực hiện tìm kiếm
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSalaryRangeChange = (value: number[]) => {
    setSalaryRange(value);
    setCurrentPage(1); // Reset to first page when salary filter changes
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div 
        className="relative py-16 px-4 mx-4 my-4 rounded-2xl bg-gray-100"
      >
        <div className="container mx-auto max-w-6xl">
          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-3xl">
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-100">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tên công ty, công việc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-14 pr-32 py-5 text-lg bg-transparent border-0 rounded-lg focus:outline-none focus:ring-0 w-full placeholder:text-gray-400"
                  style={{
                    boxShadow: 'none'
                  }}
                />
                <Button 
                  onClick={handleSearch}
                  className="absolute right-0.5 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Province Filter */}
            <Select
  value={selectedProvince}
  onValueChange={(value) => handleFilterChange("province", value)}
>
  <SelectTrigger className="bg-white border-0 rounded-lg shadow-sm">
    <div className="flex items-center gap-2 w-full overflow-hidden">
      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />

      <SelectValue
        placeholder="Tỉnh thành"
        className="
          block
          truncate
          overflow-hidden
          whitespace-nowrap
          max-w-[calc(100%-1.5rem)]
          text-left
        "
      />
    </div>
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
    {provinces.map((province) => (
      <SelectItem key={province.id} value={province.id.toString()}>
        {province.nameWithType || province.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            {/* Field Filter */}
            <Select
  value={selectedField}
  onValueChange={(value) => handleFilterChange("field", value)}
>
  <SelectTrigger className="bg-white border-0 rounded-lg shadow-sm">
    <div className="flex items-center gap-2 w-full overflow-hidden">
      <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />

      <SelectValue
        placeholder="Ngành nghề"
        className="
          block
          truncate
          overflow-hidden
          whitespace-nowrap
          max-w-[calc(100%-1.5rem)]
          text-left
        "
      />
    </div>
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">Tất cả ngành nghề</SelectItem>
    {fields.map((field) => (
      <SelectItem key={field.id} value={field.id.toString()}>
        {field.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            {/* Salary Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowSalaryRange(!showSalaryRange)}
                className="bg-white border-0 rounded-lg shadow-sm w-full justify-between h-10 px-3"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {isNegotiable ? "Thỏa thuận" : 
                     (salaryRange[0] > 1 || salaryRange[1] < 50) ? `${salaryRange[0]} - ${salaryRange[1]} triệu` : "Mức lương"}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showSalaryRange ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Salary Range Slider */}
              {showSalaryRange && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-10 p-4 bg-white shadow-lg">
                  <CardContent className="p-0">
                    {/* Checkbox Thỏa thuận */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="negotiable"
                        checked={isNegotiable}
                        onCheckedChange={(checked) => {
                          setIsNegotiable(checked as boolean);
                          setCurrentPage(1);
                        }}
                      />
                      <Label 
                        htmlFor="negotiable" 
                        className="text-sm font-medium cursor-pointer"
                      >
                        Thỏa thuận
                      </Label>
                    </div>
                    
                    {/* Salary Range Slider - disabled when negotiable is checked */}
                    {!isNegotiable && (
                      <>
                        <Label className="text-sm font-medium mb-2 block">
                          Mức lương: {salaryRange[0]} - {salaryRange[1]} triệu
                        </Label>
                        <Slider
                          value={salaryRange}
                          onValueChange={handleSalaryRangeChange}
                          max={50}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Job Type Filter */}
            <Select
  value={selectedJobType}
  onValueChange={(value) => handleFilterChange("jobType", value)}
>
  <SelectTrigger className="bg-white border-0 rounded-lg shadow-sm">
    <div className="flex items-center gap-2 w-full overflow-hidden">
      <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />

      <SelectValue
        placeholder="Loại công việc"
        className="
          block
          truncate
          overflow-hidden
          whitespace-nowrap
          max-w-[calc(100%-1.5rem)]
          text-left
        "
      />
    </div>
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">Tất cả loại công việc</SelectItem>
    {jobTypes.map((type) => (
      <SelectItem key={type} value={type}>
        {type}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            {/* Experience Filter */}
            <Select value={selectedExperience} onValueChange={(value) => handleFilterChange('experience', value)}>
              <SelectTrigger className="bg-white border-0 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Kinh nghiệm" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kinh nghiệm</SelectItem>
                {experienceOptions.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Education Filter */}
            <Select value={selectedEducation} onValueChange={(value) => handleFilterChange('education', value)}>
              <SelectTrigger className="bg-white border-0 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Học vấn" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học vấn</SelectItem>
                {educationOptions.map((edu) => (
                  <SelectItem key={edu} value={edu}>
                    {edu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
              
              {hasSearched && activeSearchQuery && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>"{activeSearchQuery}"</span>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveSearchQuery("");
                      setHasSearched(false);
                    }}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {selectedProvince && selectedProvince !== "all" && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>{provinces?.find(p => p.id.toString() === selectedProvince)?.name}</span>
                  <button 
                    onClick={() => handleFilterChange('province', "")}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {selectedField && selectedField !== "all" && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <Briefcase className="w-3 h-3" />
                  <span>{fields?.find(f => f.id.toString() === selectedField)?.name}</span>
                  <button 
                    onClick={() => handleFilterChange('field', "")}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {selectedJobType && selectedJobType !== "all" && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  <Users className="w-3 h-3" />
                  <span>{selectedJobType}</span>
                  <button 
                    onClick={() => handleFilterChange('jobType', "")}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {selectedExperience && selectedExperience !== "all" && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{selectedExperience}</span>
                  <button 
                    onClick={() => handleFilterChange('experience', "")}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {selectedEducation && selectedEducation !== "all" && (
                <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  <GraduationCap className="w-3 h-3" />
                  <span>{selectedEducation}</span>
                  <button 
                    onClick={() => handleFilterChange('education', "")}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {isNegotiable && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  <DollarSign className="w-3 h-3" />
                  <span>Thỏa thuận</span>
                  <button 
                    onClick={() => setIsNegotiable(false)}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {!isNegotiable && (salaryRange[0] !== 1 || salaryRange[1] !== 50) && (
                <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  <DollarSign className="w-3 h-3" />
                  <span>{salaryRange[0]} - {salaryRange[1]} triệu</span>
                  <button 
                    onClick={() => setSalaryRange([1, 50])}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {isLoadingJobs ? "Đang tải..." : 
             hasSearched && activeSearchQuery ? `${totalJobs} việc làm cho "${activeSearchQuery}"` :
             hasActiveFilters ? `${totalJobs} việc làm phù hợp` :
             `${totalJobs} việc làm mới nhất`}
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-gray-600 text-sm">Sắp xếp:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="salary-high">Lương cao nhất</SelectItem>
                <SelectItem value="salary-low">Lương thấp nhất</SelectItem>
                <SelectItem value="company">Tên công ty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoadingJobs ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isLoadingJobs && jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <CardContent className="p-6">
                  {/* Job Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                      {job.company?.avatarPic ? (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building className="w-6 h-6 text-gray-400" />
                          </div>
                          <Image
                            src={`/api/uploads/${job.company.avatarPic}`}
                            alt={job.company.nameCompany || "Company"}
                            width={48}
                            height={48}
                            className="object-cover relative z-10"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {job.nameJob}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {job.company?.nameCompany}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <SavedJobButton jobId={job.id} />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-green-600 font-medium">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{job.typeWork}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.province?.nameWithType || "Không xác định"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  {/* Job Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(job.createdAt)}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ApplyButton jobId={job.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isLoadingJobs ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-40 h-40 mx-auto">
                  <Image
                    src="/no-data.svg"
                    alt="Không tìm thấy dữ liệu"
                    width={160}
                    height={160}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-600">Không tìm thấy việc làm nào</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm thấy công việc phù hợp với bạn
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị {((currentPage - 1) * jobsPerPage) + 1} - {Math.min(currentPage * jobsPerPage, totalJobs)} trong tổng số {totalJobs} việc làm
            </div>
            <div className="flex justify-center items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button 
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button 
              variant="outline" 
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}