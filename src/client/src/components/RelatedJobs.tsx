'use client';

import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Building } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { formatSalary } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import SavedJobButton from '@/components/SavedJobButton';
import { Job, Company, Province } from '@/types';

// Extended job type để handle cả Job interface và API response format
type RelatedJobItem = Job & {
  title?: string;
  nameCompany?: string;
  avatarPic?: string;
  companyId?: number;
  fieldId?: number;
  provinceId?: number;
};

interface RelatedJobsProps {
  currentJobId: number;
  fieldId: number;
  fieldName?: string;
}

export default function RelatedJobs({ currentJobId, fieldId, fieldName }: RelatedJobsProps) {
  // Lấy danh sách công việc cùng field, exclude current job
  const { data: jobsResponse, isLoading } = useJobs({
    idField: fieldId,
    limit: 6, // Lấy 6 jobs để có thể exclude current job và hiển thị 4-5 jobs
    page: 1
  });

  const jobs = jobsResponse?.data?.data || [];
  // Filter out current job
  const relatedJobs = jobs.filter((job: RelatedJobItem) => job.id !== currentJobId).slice(0, 4);

  const getAvatarUrl = (avatarPic?: string) => {
    if (!avatarPic) return null;
    return `/api/uploads/${avatarPic}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Công việc liên quan</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có công việc liên quan nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        Công việc liên quan {fieldName && (
          <span className="text-primary">- {fieldName}</span>
        )}
      </h3>
      
      <div className="space-y-3">
        {relatedJobs.map((job: RelatedJobItem) => (
          <div key={job.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start space-x-3">
              {/* Company Avatar */}
              <div className={`w-12 h-12 ${getAvatarUrl(job.company?.avatarPic || job.avatarPic) ? 'bg-white' : 'bg-blue-100'} rounded-full flex items-center justify-center shadow-sm border relative overflow-hidden flex-shrink-0`}>
                {getAvatarUrl(job.company?.avatarPic || job.avatarPic) ? (
                  <Image
                    src={getAvatarUrl(job.company?.avatarPic || job.avatarPic)!}
                    alt={`Logo ${job.company?.nameCompany || job.nameCompany}`}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <Building className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Job Title - truncate với ... */}
                <Link 
                  href={`/jobs/${job.id}`}
                  className="block"
                >
                  <h4 className="font-medium text-gray-900 hover:text-primary transition-colors mb-1 truncate">
                    {(job.title || job.nameJob)?.length > 30 
                      ? `${(job.title || job.nameJob)?.substring(0, 30)}...`
                      : (job.title || job.nameJob)
                    }
                  </h4>
                </Link>

                {/* Company Name */}
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {job.company?.nameCompany || job.nameCompany}
                </p>

                {/* Salary and Location */}
                <div className="flex items-center text-sm text-gray-500 space-x-4 flex-nowrap">
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <DollarSign className="w-4 h-4" />
                    <span className="whitespace-nowrap">
                      {(job.salaryMin || job.salaryMax) 
                        ? formatSalary(job.salaryMin, job.salaryMax)
                        : 'Thỏa thuận'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 min-w-0">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {job.province?.nameWithType?.replace('Tỉnh ', '').replace('Thành phố ', '') || 
                       job.province?.name || 'Điện Biên'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex-shrink-0">
                <SavedJobButton jobId={job.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center pt-4 mt-4 border-t border-gray-100">
        <Link href={`/search?field=${fieldId}`}>
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-primary font-medium text-sm p-0 h-auto"
          >
            Xem thêm
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}
