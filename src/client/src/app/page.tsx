"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, Users, Shield, Calculator, Building, Heart, Star, HandCoins,
  TrendingUp, Package, Megaphone, Shirt, Target, MessageCircle, 
  CheckCircle, Truck, Globe, Code, Stethoscope, Headphones, ArrowLeft, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";
import { useProvinces } from "@/hooks/useProvinces";
import { useFields } from "@/hooks/useFields";
import { useAuth } from "@/contexts/AuthContext";
import { SavedJobButton } from "@/components/SavedJobButton";
import { FollowCompanyButton } from "@/components/FollowCompanyButton";
import { useApplicationStatus } from "@/hooks/useApplications";
import { showToast } from "@/utils/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Home() {
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();
  const { userType, isAuthenticated, company } = useAuth();
  
  // Search form states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Fetch companies data - limit to 8 for homepage
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useCompanies({ 
    page: 1, 
    limit: 8 
  });

  // Fetch latest jobs data - limit to 4 for homepage
  const { data: jobsResponse, isLoading: isLoadingJobs } = useJobs({ 
    page: 1, 
    limit: 4 
  });


  // Fetch provinces and fields for search form
  const { data: provincesResponse } = useProvinces();
  const { data: fieldsResponse } = useFields();
  
  const provinces = provincesResponse?.data || [];
  const fields = fieldsResponse?.data || [];

  // Handle search form submission
  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (searchKeyword.trim()) {
      searchParams.set('q', searchKeyword.trim());
    }
    
    if (selectedLocation && selectedLocation !== "all") {
      searchParams.set('location', selectedLocation);
    }
    
    // Navigate to search page with parameters
    const queryString = searchParams.toString();
    const searchUrl = queryString ? `/search?${queryString}` : '/search';
    router.push(searchUrl);
  };

  // Handle Enter key press in search inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle industry/field search
  const handleFieldSearch = (fieldName: string) => {
    // Find field ID by name
    const field = fields?.find(f => 
      f.name.toLowerCase().includes(fieldName.toLowerCase()) ||
      fieldName.toLowerCase().includes(f.name.toLowerCase())
    );
    
    const searchParams = new URLSearchParams();
    
    if (field) {
      searchParams.set('field', field.id.toString());
    } else {
      // If no exact field match, search by keyword
      searchParams.set('q', fieldName);
    }
    
    // Navigate to search page with field filter
    const queryString = searchParams.toString();
    const searchUrl = `/search?${queryString}`;
    router.push(searchUrl);
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

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary/30 to-accent/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-6 pr-0 lg:pr-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Khám phá tìm năng nghề nghiệp cùng{" "}
                <span className="text-primary">Jobify</span> -{" "}
                Bước đầu cho sự nghiệp tuơi sáng!
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tìm kiếm công việc mơ ước của bạn với hàng ngàn cơ hội việc làm từ các công ty hàng đầu. 
                Chúng tôi kết nối tài năng với cơ hội.
              </p>
              
              {/* Company Logos */}
              <div className="flex items-center space-x-4 py-4">
                <span className="text-sm text-muted-foreground">Đối tác của chúng tôi:</span>
                <div className="flex items-center space-x-3">
                  <div className="bg-card px-3 py-1 rounded shadow-sm border">
                    <span className="font-semibold text-orange-600">VNG</span>
                  </div>
                  <div className="bg-card px-3 py-1 rounded shadow-sm border">
                    <span className="font-semibold text-green-600">GHTK</span>
                  </div>
                  <div className="bg-card px-3 py-1 rounded shadow-sm border">
                    <span className="font-semibold text-red-600">viettel</span>
                  </div>
                  <div className="bg-card px-3 py-1 rounded shadow-sm border">
                    <span className="font-semibold text-orange-600">FPT</span>
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <div className="bg-card p-6 rounded-lg shadow-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Nhập tên công việc..."
                      className="pl-10"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Chọn địa điểm..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả địa điểm</SelectItem>
                        {(provinces || []).map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.nameWithType || province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 w-full"
                    onClick={handleSearch}
                  >
                    Tìm việc
                  </Button>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative flex justify-center">
        <Image
                src="/hero-illustration.svg" 
                alt="Cơ hội việc làm" 
                width={400} 
                height={300} 
                className="object-contain w-full h-auto max-w-lg"
          priority
        />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Industries */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Ngành nghề phổ biến</h2>
            <button 
              onClick={() => router.push('/fields')}
              className="text-primary hover:text-primary/80"
            >
              Xem tất cả &gt;
            </button>
          </div>
          
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
            }}
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-6xl mx-auto"
          >
            <CarouselContent>
              {/* Slide 1: Ngành nghề 1-6 */}
              <CarouselItem>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-2">
                  {[
                    { icon: Users, title: "Dịch vụ khách hàng", color: "bg-primary/10 text-primary" },
                    { icon: Building, title: "Giáo dục / Đào tạo / Thư viện", color: "bg-primary/10 text-primary" },
                    { icon: Shield, title: "Bảo hiểm", color: "bg-primary/10 text-primary" },
                    { icon: Calculator, title: "Kế toán / Kiểm toán", color: "bg-primary/10 text-primary" },
                    { icon: Building, title: "Ngân hàng / Chứng khoán", color: "bg-primary/10 text-primary" },
                    { icon: HandCoins, title: "Tài chính / Đầu tư", color: "bg-primary/10 text-primary" }
                  ].map((item, index) => (
                    <Card 
                      key={index} 
                      className="text-center p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleFieldSearch(item.title)}
                    >
                      <CardContent className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-lg ${item.color}`}>
                          <item.icon className="w-8 h-8" />
                        </div>
                        <p className="text-base font-medium text-foreground">{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>

              {/* Slide 2: Ngành nghề 7-12 */}
              <CarouselItem>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-2">
                  {[
                    { icon: TrendingUp, title: "Bán hàng / Kinh doanh", color: "bg-primary/10 text-primary" },
                    { icon: Package, title: "Hàng gia dụng", color: "bg-primary/10 text-primary" },
                    { icon: Megaphone, title: "Quảng cáo / Đối ngoại", color: "bg-primary/10 text-primary" },
                    { icon: Shirt, title: "Thời trang", color: "bg-primary/10 text-primary" },
                    { icon: Target, title: "Tiếp thị", color: "bg-primary/10 text-primary" },
                    { icon: MessageCircle, title: "Tư vấn", color: "bg-primary/10 text-primary" }
                  ].map((item, index) => (
                    <Card 
                      key={index} 
                      className="text-center p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleFieldSearch(item.title)}
                    >
                      <CardContent className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-lg ${item.color}`}>
                          <item.icon className="w-8 h-8" />
                        </div>
                        <p className="text-base font-medium text-foreground">{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>

              {/* Slide 3: Ngành nghề 13-18 */}
              <CarouselItem>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-2">
                  {[
                    { icon: CheckCircle, title: "Quản lý chất lượng", color: "bg-primary/10 text-primary" },
                    { icon: Truck, title: "Vận chuyển / Giao hàng / Kho bãi", color: "bg-primary/10 text-primary" },
                    { icon: Globe, title: "Xuất nhập khẩu / Ngoại thương", color: "bg-primary/10 text-primary" },
                    { icon: Code, title: "CNTT - Phần mềm", color: "bg-primary/10 text-primary" },
                    { icon: Stethoscope, title: "Chăm sóc sức khỏe / Y tế", color: "bg-primary/10 text-primary" },
                    { icon: Headphones, title: "Dịch vụ khách hàng", color: "bg-primary/10 text-primary" }
                  ].map((item, index) => (
                    <Card 
                      key={index} 
                      className="text-center p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleFieldSearch(item.title)}
                    >
                      <CardContent className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-lg ${item.color}`}>
                          <item.icon className="w-8 h-8" />
                        </div>
                        <p className="text-base font-medium text-foreground">{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index + 1 === current 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Đi đến slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="flex items-center justify-center">
                <Image
                  src="/undraw_hiring_8szx.svg"
                  alt="Hiring illustration"
                  width={150}
                  height={100}
                  className="object-contain w-full h-auto max-w-md"
                  priority
                />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Cổng thông tin việc làm đáng tin cậy và phổ biến
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hơn 10 năm kinh nghiệm trong lĩnh vực tuyển dụng, chúng tôi tự hào mang đến cho bạn 
                những cơ hội việc làm chất lượng cao từ các doanh nghiệp uy tín hàng đầu Việt Nam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/login')}
                >
                  Tìm việc ngay
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push('/employer/login')}
                >
                  Đăng việc làm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Công ty hàng đầu</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingCompanies ? (
              // Loading skeleton
              Array.from({ length: 8 }, (_, index) => (
                <Card key={index} className="bg-card border border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-end mb-4">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              companiesResponse?.data?.map((company) => (
                <Card key={company.id} className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleCompanyClick(company.id)}>
                  <CardContent className="p-6">
                    {/* Heart Button - Top Right */}
                    <div className="flex justify-end mb-4">
                      <FollowCompanyButton companyId={company.id} />
                    </div>
                    
                    {/* Large Company Logo - Center */}
                    <div className="flex justify-center mb-6">
                      <div className={`w-24 h-24 ${company.avatarPic ? 'bg-white' : 'bg-gradient-to-br from-primary/10 to-primary/20'} rounded-lg flex items-center justify-center shadow-sm border relative overflow-hidden`}>
                        {company.avatarPic ? (
                          <Image
                            src={`/api/uploads/${company.avatarPic}`}
                            alt={`${company.nameCompany} logo`}
                            fill
                            className="object-cover rounded-lg"
                            onError={(e) => {
                              // Hide the image if it fails to load, showing the Building icon instead
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show fallback
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-12 h-12 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12h4"/><path d="M6 16h4"/></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <Building className="w-12 h-12 text-primary/60" />
                        )}
                      </div>
                    </div>
                    
                    {/* Company Info - Bottom */}
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-foreground">{company.nameCompany}</h3>
                      
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
              )) || []
            )}
          </div>
          
          {/* View All Companies Button */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => router.push('/companies')}>
              Xem tất cả công ty
            </Button>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Quy trình ứng tuyển</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                stepImage: "/1.svg",
                title: "Tạo tài khoản",
                description: "Đăng ký tài khoản miễn phí để truy cập hàng ngàn cơ hội việc làm"
              },
              {
                step: "2", 
                stepImage: "/2.svg",
                title: "Cập nhật hồ sơ",
                description: "Hoàn thiện hồ sơ của bạn để tăng cơ hội được nhà tuyển dụng chú ý"
              },
              {
                step: "3",
                stepImage: "/3.svg",
                title: "Ứng tuyển",
                description: "Tìm kiếm và ứng tuyển vào những vị trí phù hợp với bạn"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center">
                    <Image
                      src={item.stepImage}
                      alt={`Bước ${item.step}`}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Việc làm mới nhất</h2>
          </div>
          
          {isLoadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(jobsResponse?.data?.data || []).map((job: any) => {
                const formatSalary = (min?: number, max?: number) => {
                  if (!min && !max) return "Thỏa thuận";
                  if (min && max) return `${min} - ${max} triệu`;
                  if (min) return `Từ ${min} triệu`;
                  if (max) return `Đến ${max} triệu`;
                  return "Thỏa thuận";
                };

                return (
                  <Card 
                    key={job.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                          {job.company?.avatarPic ? (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Building className="w-6 h-6 text-gray-400" />
                              </div>
            <Image
                                src={`/api/uploads/${job.company.avatarPic}`}
                                alt={`${job.company.nameCompany} logo`}
                                width={48}
                                height={48}
                                className="object-cover relative z-10"
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
                        <div>
                          <CardTitle className="text-lg">{job.nameJob}</CardTitle>
                          <CardDescription>{job.company?.nameCompany}</CardDescription>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SavedJobButton jobId={job.id} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.province?.nameWithType || 'Không xác định'}
                        </span>
                        <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <span>{job.experience}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" onClick={(e) => e.stopPropagation()}>{job.typeWork}</Badge>
                        <ApplyButton jobId={job.id} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {!isLoadingJobs && (!jobsResponse?.data?.data || jobsResponse.data.data.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có việc làm nào</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/search')}
            >
              Xem tất cả việc làm
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}