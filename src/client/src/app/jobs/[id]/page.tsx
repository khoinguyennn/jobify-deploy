'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, MapPin, Calendar, DollarSign, Users, GraduationCap, User, Clock, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJob } from '@/hooks/useJobs';
import { useProvinces, useFields } from '@/hooks/useReferenceData';
import { Province, Field } from '@/types';
import { formatSalary, formatTimeAgo } from '@/utils';
import SavedJobButton from '@/components/SavedJobButton';
import { useAuth } from '@/contexts/AuthContext';
import { useApplicationStatus } from '@/hooks/useApplications';
import { showToast } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import RelatedJobs from '@/components/RelatedJobs';
import ApplicationDialog from '@/components/ApplicationDialog';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  
  const { user, isAuthenticated, userType } = useAuth();
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(parseInt(jobId));
  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(
    parseInt(jobId),
    isAuthenticated && userType === 'user' // Chỉ check status cho user đã login
  );
  const { data: provincesResponse } = useProvinces();
  const { data: fieldsResponse } = useFields();

  // Get avatar URL with fallback (same logic as homepage)
  const getAvatarUrl = (avatarPic?: string) => {
    if (!avatarPic) return null;
    return `/api/uploads/${avatarPic}`;
  };

  const provinces = (provincesResponse as any)?.data || [];
  const fields = (fieldsResponse as any)?.data || [];

  // Auto-open dialog when accessed with apply=true query parameter
  useEffect(() => {
    const shouldApply = searchParams.get('apply');
    if (shouldApply === 'true' && !statusLoading && job) {
      const cleanUrl = () => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      };

      if (isAuthenticated && userType === 'user') {
        if (applicationStatus?.hasApplied === false) {
          setIsApplicationDialogOpen(true);
        } else if (applicationStatus?.hasApplied === true) {
          showToast.info('Bạn đã ứng tuyển vị trí này rồi');
        }
      } else if (!isAuthenticated) {
        showToast.warning('Vui lòng đăng nhập để ứng tuyển');
      } else {
        showToast.warning('Chỉ ứng viên mới có thể ứng tuyển');
      }
      
      cleanUrl();
    }
  }, [searchParams, statusLoading, job, isAuthenticated, userType, applicationStatus]);

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (userType === 'company') {
      showToast.warning('Chỉ người tìm việc mới có thể ứng tuyển');
      return;
    }

    setIsApplicationDialogOpen(true);
  };

  const handleKeywordClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  // Generate keywords for suggestions
  const keywords = [
    'Nhân sự', 'Phát triển', 'Quản lý',
    'Kế toán', 'Kỹ thuật', 'Thiết kế',
    'Marketing', 'Bán hàng', 'Hỗ trợ',
    'Tư vấn', 'IT', 'Nghiên cứu', 'Y tế',
    'Luật', 'Sản xuất', 'Dịch vụ',
    'Nghệ thuật', 'Xây dựng', 'Giáo dục',
    'Nông nghiệp'
  ];

  if (jobLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/not-found.svg"
              alt="Không tìm thấy công việc"
              width={200}
              height={200}
              className="opacity-80"
            />
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Không tìm thấy công việc</h2>
          <p className="text-gray-500 mb-6">Công việc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => router.push('/')}>Quay về trang chủ</Button>
        </div>
      </div>
    );
  }

  const jobData = job;
  const province = provinces?.find((p: Province) => p.id === (jobData?.provinceId || jobData?.idProvince));
  const field = fields?.find((f: Field) => f.id === (jobData?.fieldId || jobData?.idField));

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button
          onClick={() => router.push('/')}
          className="hover:text-primary transition-colors"
        >
          Trang chủ
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => router.push(`/search?field=${jobData.fieldId || jobData.idField}`)}
          className="hover:text-primary transition-colors"
        >
          {jobData?.field?.name || field?.name || 'Tất cả ngành nghề'}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-800 font-medium">{jobData.title || jobData.nameJob}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 ${getAvatarUrl(jobData.company?.avatarPic) ? 'bg-white' : 'bg-primary/10'} rounded-lg flex items-center justify-center shadow-sm border relative overflow-hidden`}>
                    {getAvatarUrl(jobData.company?.avatarPic) ? (
                      <Image
                        src={getAvatarUrl(jobData.company?.avatarPic)!}
                        alt={`Logo ${jobData.nameCompany || jobData.company?.nameCompany}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{jobData.title || jobData.nameJob}</h1>
                    <Link 
                      href={`/companies/${jobData.idCompany || jobData.companyId || jobData.company?.id}`}
                      className="text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      {jobData.nameCompany || jobData.company?.nameCompany}
                    </Link>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {!isAuthenticated || userType === 'company' ? (
                    <Button 
                      onClick={handleApply}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                    >
                      Ứng tuyển
                    </Button>
                  ) : statusLoading ? (
                    <Button disabled className="bg-primary text-white px-6">
                      Đang kiểm tra...
                    </Button>
                  ) : applicationStatus?.hasApplied ? (
                    <Button 
                      disabled 
                      className="bg-gray-400 text-white px-6 cursor-not-allowed"
                    >
                      Đã ứng tuyển
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleApply}
                      className="bg-primary hover:bg-primary/90 text-white px-6"
                    >
                      Ứng tuyển
                    </Button>
                  )}
                  <SavedJobButton jobId={jobData.id} />
                </div>
              </div>

              {/* Job Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Địa điểm</p>
                    <p className="text-sm text-gray-600">{jobData?.province?.nameWithType || province?.name || province?.nameWithType || 'Không xác định'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Ngành nghề</p>
                    <p className="text-sm text-gray-600">{jobData?.field?.name || field?.name || 'Khác'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Lương</p>
                    <p className="text-sm text-gray-600">
                      {jobData.salaryMin || jobData.salaryMax 
                        ? formatSalary(jobData.salaryMin, jobData.salaryMax)
                        : 'Thỏa thuận'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Giới tính</p>
                    <p className="text-sm text-gray-600">
                      {(jobData.gender || jobData.sex) === 'male' ? 'Nam' : 
                       (jobData.gender || jobData.sex) === 'female' ? 'Nữ' : 'Cả hai'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Kinh nghiệm</p>
                    <p className="text-sm text-gray-600">{jobData.experience || 'Không yêu cầu'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Hình thức</p>
                    <p className="text-sm text-gray-600">{jobData.workingType || jobData.typeWork || 'Nhân viên chính thức'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Học vấn</p>
                    <p className="text-sm text-gray-600">{jobData.education || 'Không yêu cầu'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-primary mb-4">MÔ TẢ CÔNG VIỆC</h2>
              <div className="text-gray-700">
                {(jobData.description || jobData.desc) ? (
                  <div 
                    className="prose prose-sm max-w-none job-content"
                    dangerouslySetInnerHTML={{ 
                      __html: (jobData.description || jobData.desc) || ''
                    }} 
                  />
                ) : (
                  <p className="text-gray-400 italic">Chưa có mô tả chi tiết cho công việc này.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Requirements */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-primary mb-4">YÊU CẦU CÔNG VIỆC</h2>
              
              {(jobData.requirement || jobData.request) ? (
                <div className="text-gray-700">
                  <div 
                    className="prose prose-sm max-w-none job-content"
                    dangerouslySetInnerHTML={{ 
                      __html: (jobData.requirement || jobData.request) || ''
                    }} 
                  />
                </div>
              ) : (
                <p className="text-gray-400 italic">Chưa có thông tin yêu cầu công việc.</p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          {(jobData.benefit || jobData.other) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4">THÔNG TIN KHÁC</h2>
                <div className="text-gray-700">
                  <div 
                    className="prose prose-sm max-w-none job-content"
                    dangerouslySetInnerHTML={{ 
                      __html: (jobData.benefit || jobData.other) || ''
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Công việc liên quan */}
          {(jobData.fieldId || jobData.idField) && (
            <Card>
              <CardContent className="p-6">
                <RelatedJobs 
                  currentJobId={jobData.id}
                  fieldId={jobData.fieldId || jobData.idField}
                  fieldName={jobData.field?.name || field?.name}
                />
              </CardContent>
            </Card>
          )}
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

      {/* Application Dialog */}
      <ApplicationDialog
        isOpen={isApplicationDialogOpen}
        onClose={() => setIsApplicationDialogOpen(false)}
        job={jobData}
      />
    </div>
  );
}

// CSS styles cho hiển thị content từ Tiptap
const styles = `
  .job-content h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.2;
    color: #1f2937;
  }
  .job-content h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.3;
    color: #1f2937;
  }
  .job-content h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.4;
    color: #1f2937;
  }
  .job-content ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .job-content ol {
    list-style-type: decimal;
    margin-left: 1.5rem;
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  .job-content li {
    margin: 0.25rem 0;
    padding-left: 0.25rem;
  }
  .job-content p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
  .job-content strong {
    font-weight: bold;
  }
  .job-content em {
    font-style: italic;
  }
  .job-content u {
    text-decoration: underline;
  }
  .job-content s {
    text-decoration: line-through;
  }
  .job-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #6b7280;
  }
  .job-content code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875rem;
  }
  .job-content pre {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
  }
  .job-content pre code {
    background: none;
    padding: 0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('job-content-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'job-content-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }
}
