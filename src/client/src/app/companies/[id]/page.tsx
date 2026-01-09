"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Users, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanyDetail } from "@/hooks/useCompanies";
import { useCompanyJobs } from "@/hooks/useCompanyJobs";
import { useCompanyFollowerCount } from "@/hooks/useFollowedCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { FollowCompanyButton } from "@/components/FollowCompanyButton";
import { SavedJobButton } from "@/components/SavedJobButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplicationStatus } from "@/hooks/useApplications";
import { showToast } from "@/utils/toast";

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
      <Button size="sm" disabled className="bg-gray-300 text-sm px-4 py-2">
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
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2"
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
      className={`${
        applicationStatus?.hasApplied 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-primary hover:bg-primary/90'
      } text-primary-foreground text-sm px-4 py-2`}
      onClick={handleApplyClick}
      disabled={statusLoading || authLoading || applicationStatus?.hasApplied}
    >
      {authLoading ? 'Đang tải...' :
       statusLoading ? 'Đang kiểm tra...' : 
       applicationStatus?.hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
    </Button>
  );
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = parseInt(params.id as string);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 4;

  // Auth context
  const { userType, isAuthenticated, company } = useAuth();

  // Fetch company data
  const { data: companyData, isLoading: companyLoading, error: companyError } = useCompanyDetail(companyId);
  const { data: companyJobs = [], isLoading: jobsLoading } = useCompanyJobs(companyId);
  const { data: followerCount } = useCompanyFollowerCount(companyId);

  // Redirect to profile if current company is viewing their own page
  useEffect(() => {
    if (isAuthenticated && userType === 'company' && company?.id === companyId) {
      router.replace('/company/profile');
    }
  }, [isAuthenticated, userType, company?.id, companyId, router]);

  // Share functions
  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Công ty ${companyData?.nameCompany} - Cơ hội việc làm tuyệt vời!`);
    const body = encodeURIComponent(
      `Tôi muốn chia sẻ với bạn về công ty ${companyData?.nameCompany}.\n\n` +
      `${companyData?.nameCompany} đang tuyển dụng ${companyJobs.length} vị trí công việc.\n\n` +
      `Xem chi tiết tại: ${window.location.href}\n\n` +
      `Được chia sẻ từ Jobify - Nền tảng tìm việc hàng đầu.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Khám phá cơ hội việc làm tại ${companyData?.nameCompany}! 💼\n` +
      `${companyJobs.length} vị trí đang tuyển dụng.`
    );
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Format job data for display
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Thỏa thuận";
    if (min && max) return `${min} - ${max} triệu`;
    if (min) return `Từ ${min} triệu`;
    if (max) return `Đến ${max} triệu`;
    return "Thỏa thuận";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    
    // Tính toán chính xác các đơn vị thời gian
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Hiển thị theo thời gian thực tế
    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  // Pagination calculations
  const totalJobs = companyJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = companyJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle keyword click
  const handleKeywordClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // Early return for redirect case to avoid flash content
  if (isAuthenticated && userType === 'company' && company?.id === companyId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  // Loading state
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-2 py-8">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-start gap-6 pb-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (companyError || !companyData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải thông tin công ty</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const keywords = [
    "Nhân sự", "Phát triển", "Quản lý", "Kế toán", "Kỹ thuật", "Thiết kế",
    "Marketing", "Bán hàng", "Hỗ trợ", "Tư vấn", "IT", "Nghiên cứu", "Y tế",
    "Luật", "Sản xuất", "Dịch vụ", "Nghệ thuật", "Xây dựng", "Giáo dục",
    "Nông nghiệp"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        {/* Company Info */}
        <div className="bg-white pt-6">
          <div className="max-w-6xl mx-auto px-2">
            <div className="flex items-start gap-6 pb-6">
              {/* Company Avatar */}
              <div className="relative">
                <UserAvatar 
                  user={{ 
                    name: companyData.nameCompany, 
                    avatarPic: companyData.avatarPic 
                  }} 
                  size="xl"
                  className="w-32 h-32 border-4 border-white shadow-lg"
                />
              </div>

              {/* Company Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nhà tuyển dụng</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{companyData.nameCompany}</h1>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      {companyData.scale && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{companyData.scale}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{followerCount?.count || 0} người theo dõi</span>
                      </div>
                      {companyData?.web && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={companyData.web.startsWith('http') ? companyData.web : `https://${companyData.web}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {companyData.web}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <FollowCompanyButton companyId={companyId} variant="button" size="md" />
                </div>
              </div>
            </div>

            {/* Navigation Tab - Only Giới thiệu */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <div className="py-4 px-1 border-b-2 border-primary text-primary font-medium text-sm">
                  Giới thiệu
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Về công ty */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Về công ty</h2>
                <div className="text-gray-600 leading-relaxed">
                  {!companyData.intro || companyData.intro.trim() === "" ? (
                    <span className="text-gray-400 italic">Chưa có thông tin về công ty</span>
                  ) : (
                    <div 
                      className="prose prose-sm max-w-none company-intro-content"
                      dangerouslySetInnerHTML={{ __html: companyData.intro }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tuyển dụng */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tuyển dụng</h2>
                
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-4">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : companyJobs.length > 0 ? (
                  <div className="space-y-4">
                    {currentJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                              {job.company.avatarPic ? (
                                <Image
                                  src={`/api/uploads/${job.company.avatarPic}`}
                                  alt={job.company.nameCompany}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full bg-primary flex items-center justify-center">
                                  <span className="text-white text-lg font-bold">
                                    {job.company.nameCompany.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{job.nameJob}</h3>
                              <p className="text-sm text-gray-600 mb-2">{companyData?.nameCompany}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                                <span>{job.typeWork}</span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.province?.nameWithType || job.province?.name || 'Không xác định'}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-400">{formatTimeAgo(job.createdAt)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {job.deletedAt ? (
                              <Button 
                                disabled 
                                className="bg-red-600 hover:bg-red-600 text-white text-sm px-4 py-2 cursor-not-allowed"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ngừng ứng tuyển
                              </Button>
                            ) : (
                              <ApplyButton jobId={job.id} />
                            )}
                            <div onClick={(e) => e.stopPropagation()}>
                              <SavedJobButton jobId={job.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center pt-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-800"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </Button>
                          
                          {/* Page Numbers */}
                          {Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <Button
                                key={pageNumber}
                                size="sm"
                                onClick={() => handlePageClick(pageNumber)}
                                className={
                                  currentPage === pageNumber
                                    ? "bg-primary text-primary-foreground w-8 h-8 text-sm"
                                    : "bg-white text-gray-600 hover:bg-gray-100 w-8 h-8 text-sm border border-gray-200"
                                }
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-800"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Chưa có tin tuyển dụng nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Địa chỉ & Chia sẻ */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Địa chỉ</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{companyData.provinceName || companyData.provinceFullName || 'Chưa cập nhật'}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-4">Chia sẻ</h3>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 p-0" 
                    title="Chia sẻ lên Facebook"
                    onClick={handleShareFacebook}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-10 h-10 p-0 hover:bg-gray-100" 
                    title="Gửi qua Email"
                    onClick={handleShareEmail}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-black hover:bg-gray-800 text-white w-10 h-10 p-0" 
                    title="Chia sẻ lên X"
                    onClick={handleShareTwitter}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gợi ý từ khóa */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Gợi ý từ khóa</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary cursor-pointer text-sm py-1 px-3 transition-colors"
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS styles cho hiển thị content
const styles = `
  .company-intro-content h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.2;
    color: #1f2937;
  }
  .company-intro-content h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.3;
    color: #1f2937;
  }
  .company-intro-content h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.4;
    color: #1f2937;
  }
  .company-intro-content ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .company-intro-content ol {
    list-style-type: decimal;
    margin-left: 1.5rem;
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .company-intro-content li {
    margin: 0.25rem 0;
    padding-left: 0.25rem;
  }
  .company-intro-content p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  .company-intro-content strong {
    font-weight: bold;
  }
  .company-intro-content em {
    font-style: italic;
  }
  .company-intro-content u {
    text-decoration: underline;
  }
  .company-intro-content s {
    text-decoration: line-through;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('company-intro-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'company-intro-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
