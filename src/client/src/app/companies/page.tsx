'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, ChevronDown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanies } from '@/hooks/useCompanies';
import { useProvinces } from '@/hooks/useProvinces';
import { useAuth } from '@/contexts/AuthContext';
import { FollowCompanyButton } from '@/components/FollowCompanyButton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Company {
  id: number;
  nameCompany: string;
  avatarPic?: string;
  provinceId: number;
  companyScale: string;
  jobCount: number;
  provinceName?: string;
  provinceFullName?: string;
}

const companySizes = [
  { id: 'under-10', label: 'Ít hơn 10 nhân viên', backendValue: null }, // Not supported by backend
  { id: '10-20', label: '10 - 20 nhân viên', backendValue: null }, // Not supported by backend
  { id: '20-100', label: '20 - 100 nhân viên', backendValue: '20 - 100' },
  { id: '100-500', label: '100 - 500 nhân viên', backendValue: '100 - 500' },
  { id: '500-1000', label: '500 - 1000 nhân viên', backendValue: '500 - 1000' },
  { id: '1000-5000', label: '1000 - 5000 nhân viên', backendValue: '1000 - 5000' },
  { id: 'over-5000', label: 'Nhiều hơn 5000 nhân viên', backendValue: 'nhiều hơn 5000' },
];

// Helper function to get backend scale value from selected sizes
const getBackendScaleValue = (selectedSizes: string[]): string | undefined => {
  // Only use the first selected size that has a backend value
  const selectedSize = selectedSizes.find(sizeId => {
    const size = companySizes.find(s => s.id === sizeId);
    return size?.backendValue;
  });
  
  if (selectedSize) {
    const size = companySizes.find(s => s.id === selectedSize);
    return size?.backendValue || undefined;
  }
  
  return undefined;
};

// Helper function to check if selected size is unsupported
const hasUnsupportedScaleSelected = (selectedSizes: string[]): boolean => {
  return selectedSizes.some(sizeId => {
    const size = companySizes.find(s => s.id === sizeId);
    return size && !size.backendValue;
  });
};

export default function CompaniesPage() {
  const router = useRouter();
  const { userType, isAuthenticated, company } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  const companiesPerPage = 6;

  // Build search params (same logic as homepage)
  const backendScaleValue = getBackendScaleValue(selectedSizes);
  const isUnsupportedScaleSelected = hasUnsupportedScaleSelected(selectedSizes);
  
  const searchParams = {
    page: currentPage,
    limit: companiesPerPage,
    ...(activeSearchTerm && { keyword: activeSearchTerm }),
    ...(selectedProvinces.length > 0 && { province: parseInt(selectedProvinces[0]) }),
    ...(backendScaleValue && { scale: backendScaleValue }),
  };

  // API calls (same logic as homepage)
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useCompanies(searchParams);
  const { data: provincesResponse, isLoading: isLoadingProvinces } = useProvinces();

  // Data extraction (same logic as homepage)
  const companies = isUnsupportedScaleSelected ? [] : (companiesResponse?.data || []);
  const totalCompanies = isUnsupportedScaleSelected ? 0 : (companiesResponse?.total || 0);
  const totalPages = Math.ceil(totalCompanies / companiesPerPage);
  const provinces = provincesResponse?.data || [];

  // Handle search
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProvinceChange = (provinceId: string, checked: boolean) => {
    if (checked) {
      setSelectedProvinces([provinceId]); // Only allow one province selection for now
    } else {
      setSelectedProvinces([]);
    }
    setCurrentPage(1);
  };

  const handleSizeChange = (sizeId: string, checked: boolean) => {
    if (checked) {
      // Only allow one size selection at a time (like provinces)
      setSelectedSizes([sizeId]);
    } else {
      setSelectedSizes([]);
    }
    setCurrentPage(1);
  };

  // Handle company click
  const handleCompanyClick = (companyId: number) => {
    // If current company is viewing their own card, redirect to profile
    if (isAuthenticated && userType === 'company' && company?.id === companyId) {
      router.push('/company/profile');
    } else {
      router.push(`/companies/${companyId}`);
    }
  };

  // Get avatar URL with fallback (same logic as homepage)
  const getAvatarUrl = (avatarPic?: string) => {
    if (!avatarPic) return null;
    return `/api/uploads/${avatarPic}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Nhà tuyển dụng hàng đầu</h1>
            
            {/* Search Bar */}
            <div className="flex max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Tìm công ty"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-r-lg"
              >
                Tìm
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Location Filter */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Địa chỉ</h3>
              {isLoadingProvinces ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {provinces.map((province) => (
                    <div key={province.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`province-${province.id}`}
                        checked={selectedProvinces.includes(province.id.toString())}
                        onCheckedChange={(checked) => 
                          handleProvinceChange(province.id.toString(), checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={`province-${province.id}`}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {province.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Size Filter */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quy mô</h3>
              <div className="space-y-3">
                {companySizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`size-${size.id}`}
                      checked={selectedSizes.includes(size.id)}
                      onCheckedChange={(checked) => 
                        handleSizeChange(size.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`size-${size.id}`}
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      {size.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            {!isLoadingCompanies && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Tìm thấy <span className="font-semibold">{totalCompanies}</span> công ty
                  {activeSearchTerm && (
                    <span> cho từ khóa "<span className="font-semibold">{activeSearchTerm}</span>"</span>
                  )}
                  {backendScaleValue && (
                    <span> với quy mô "<span className="font-semibold">{backendScaleValue}</span>"</span>
                  )}
                  {isUnsupportedScaleSelected && selectedSizes.length > 0 && (
                    <span> với quy mô "<span className="font-semibold">
                      {companySizes.find(s => s.id === selectedSizes[0])?.label}
                    </span>"</span>
                  )}
                </p>
              </div>
            )}

            {/* Companies Grid */}
            {isUnsupportedScaleSelected ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy công ty</h3>
                <p className="text-gray-500">Quy mô này hiện chưa được hệ thống hỗ trợ</p>
              </div>
            ) : isLoadingCompanies ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                      </div>
                      <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-32 mx-auto" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </div>
                      <div className="flex justify-center mt-4">
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy công ty</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <Card 
                    key={company.id} 
                    className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleCompanyClick(company.id)}
                  >
                    <CardContent className="p-6">
                      {/* Follow Button - Top Right (same as homepage) */}
                      <div className="flex justify-end mb-4">
                        <FollowCompanyButton companyId={company.id} />
                      </div>
                      
                      {/* Company Logo */}
                      <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 ${getAvatarUrl(company.avatarPic) ? 'bg-white' : 'bg-gradient-to-br from-primary/10 to-primary/20'} rounded-lg flex items-center justify-center shadow-sm border relative overflow-hidden`}>
                          {getAvatarUrl(company.avatarPic) ? (
                            <Image
                              src={getAvatarUrl(company.avatarPic)!}
                              alt={`${company.nameCompany} logo`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <Building className="w-8 h-8 text-primary/60" />
                          )}
                        </div>
                      </div>

                      {/* Company Info - Same as homepage */}
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold text-foreground">
                          {company.nameCompany}
                        </h3>
                        
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {company.provinceName || company.provinceFullName || 'Chưa cập nhật'}
                        </div>

                        <div className="text-sm font-medium text-purple-600">
                          {company.jobCount || 0} việc làm
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoadingCompanies && !isUnsupportedScaleSelected && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </Button>
                
                {/* Page Numbers */}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
