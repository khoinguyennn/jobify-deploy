'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Sparkles, Lock, X, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Target, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/utils/toast';
import { cvScoringService, type CVScoringResult, type Job } from '@/services/cvScoringService';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function CVEvaluationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userType } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<CVScoringResult | null>(null);
  const hasShownToastRef = useRef(false);
  const isRedirectingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Kiểm tra authentication - Cho phép cả user và company
  useEffect(() => {
    if (!isLoading && !hasShownToastRef.current && !isRedirectingRef.current) {
      if (!isAuthenticated) {
        hasShownToastRef.current = true;
        isRedirectingRef.current = true;
        showToast.warning('Vui lòng đăng nhập để sử dụng tính năng đánh giá CV');
        
        // Delay redirect một chút để tránh race condition
        setTimeout(() => {
          router.push('/login');
        }, 100);
        return;
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowJobSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated (but not if already showing toast/redirecting)
  if (!isAuthenticated && !hasShownToastRef.current && !isRedirectingRef.current) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để sử dụng tính năng đánh giá CV với AI.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-primary hover:bg-primary/90"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (file: File) => {
    // Kiểm tra loại file (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Chỉ hỗ trợ file PDF, DOCX, JPG, PNG');
      return;
    }

                    // Kiểm tra kích thước file (tối đa 10MB theo API)
    if (file.size > 10 * 1024 * 1024) {
      showToast.error('File không được vượt quá 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Search jobs when user types
  const handleJobTitleChange = (value: string) => {
    setJobTitle(value);
    setSelectedJob(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      setShowJobSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearchingJobs(true);
          const searchResults = await cvScoringService.searchJobs(value.trim());
          setJobs(searchResults);
        } catch (error) {
          console.error('Error searching jobs:', error);
        } finally {
          setIsSearchingJobs(false);
        }
      }, 300);
    } else {
      setShowJobSuggestions(false);
      setJobs([]);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setJobTitle(job.nameJob);
    setShowJobSuggestions(false);
  };

  const handleEvaluate = async () => {
    if (!jobTitle.trim()) {
      showToast.warning('Vui lòng nhập tên công việc mục tiêu');
      return;
    }
    
    if (!selectedFile) {
      showToast.warning(userType === 'user' ? 'Vui lòng tải lên CV của bạn' : 'Vui lòng tải lên CV cần đánh giá');
      return;
    }

    // Nếu không có job được chọn từ dropdown, thử tìm job đầu tiên phù hợp
    let jobToUse = selectedJob;
    if (!jobToUse && jobs.length > 0) {
      jobToUse = jobs[0];
    }

    if (!jobToUse) {
      showToast.warning('Không tìm thấy công việc phù hợp. Vui lòng chọn từ danh sách gợi ý.');
      return;
    }

    try {
      setIsEvaluating(true);
      setEvaluationResult(null);
      
      const result = await cvScoringService.scoreCV({
        cvFile: selectedFile,
        jobId: jobToUse.id
      });
      
      setEvaluationResult(result);
      showToast.success('Đánh giá CV thành công!');
      
      // Scroll to result section
      setTimeout(() => {
        const resultSection = document.getElementById('evaluation-result');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      
    } catch (error: any) {
      console.error('CV evaluation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi đánh giá CV';
      showToast.error(errorMessage);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
       <div className="container mx-auto px-4 py-8">
        {/* Header */}
         <div className="text-center mb-8">
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 mb-6 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 mr-2" />
            AI POWER
          </Badge>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
  Tối ưu hóa CV của bạn cùng{' '}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
    AI thông minh
  </span>
</h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {userType === 'user' 
              ? 'Nhận phản hồi tích cực, điểm số phù hợp và gợi ý cải thiện để tăng cơ hội trúng tuyển vào công việc mơ ước chỉ trong vài giây.'
              : 'Đánh giá CV của ứng viên một cách khách quan và chính xác để tìm ra ứng viên phù hợp nhất với vị trí tuyển dụng.'
            }
          </p>
        </div>

        {/* Main Content */}
         <div className="max-w-4xl mx-auto">
           <div className="space-y-6">
            {/* Step 1: Chọn công việc mục tiêu */}
             <Card className="border border-gray-100 shadow-md rounded-xl">
             <CardContent className="px-6 py-4 md:px-8 md:py-5">
                 <div className="flex items-center mb-4">
                   <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4">
                     1
                   </div>
                  <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">Chọn công việc mục tiêu</h3>
                    <p className="text-gray-600 text-sm">AI cần biết bạn đang ứng tuyển vị trí nào để đánh giá chính xác.</p>
                  </div>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tên công việc
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={userType === 'user' ? "Ví dụ: Frontend Developer" : "Ví dụ: Backend Developer, UI/UX Designer"}
                      value={jobTitle}
                      onChange={(e) => handleJobTitleChange(e.target.value)}
                      onFocus={() => {
                        if (jobs.length > 0) {
                          setShowJobSuggestions(true);
                        }
                      }}
                      className="pl-10 h-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {selectedJob && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Job suggestions dropdown */}
                  {showJobSuggestions && (jobs.length > 0 || isSearchingJobs) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isSearchingJobs && (
                        <div className="p-3 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mx-auto mb-2"></div>
                          Đang tìm kiếm...
                        </div>
                      )}
                      
                      {!isSearchingJobs && jobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectJob(job)}
                        >
                          <div className="font-medium text-gray-900">{job.nameJob}</div>
                          <div className="text-sm text-gray-500">{job.company.nameCompany}</div>
                        </div>
                      ))}
                      
                      {!isSearchingJobs && jobs.length === 0 && jobTitle.trim().length >= 2 && (
                        <div className="p-3 text-center text-gray-500">
                          Không tìm thấy công việc phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Tải lên CV */}
             <Card className="border border-gray-100 shadow-md rounded-xl">
               <CardContent className="px-6 py-4 md:px-8 md:py-5">
                 <div className="flex items-center mb-4">
                   <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4">
                     2
                   </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {userType === 'user' ? 'Tải lên CV của bạn' : 'Tải lên CV cần đánh giá'}
                    </h3>
                    <p className="text-gray-600 text-sm">Hỗ trợ định dạng PDF, DOCX, JPG, PNG (Tối đa 10MB).</p>
                  </div>
                </div>

                <div
                   className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                    isDragOver
                      ? 'border-purple-500 bg-purple-50'
                      : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white-50 hover:border-purple-400 hover:bg-purple-25'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('cv-upload')?.click()}
                      >
                        Chọn file khác
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-2">
                          Kéo thả CV vào đây hoặc{' '}
                          <label htmlFor="cv-upload" className="text-purple-600 cursor-pointer hover:text-purple-700">
                            chọn tệp
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">
                          Chúng tôi cam kết bảo mật thông tin trong CV được tải lên.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluate Button */}
           <div className="text-center mt-8">
             <Button
               onClick={handleEvaluate}
               disabled={!jobTitle.trim() || !selectedFile || isEvaluating}
               size="lg"
               className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isEvaluating ? (
                 <>
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                   Đang phân tích...
                 </>
               ) : (
                 <>
                   <Sparkles className="w-5 h-5 mr-2" />
                   Đánh giá ngay
                 </>
               )}
             </Button>
          </div>

          {/* Evaluation Results */}
          {evaluationResult && (
            <div id="evaluation-result" className="mt-12 space-y-6">
              <Separator className="my-8" />
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kết quả đánh giá CV</h2>
                <p className="text-gray-600">Được phân tích bởi AI thông minh</p>
              </div>
              
              {/* Score Overview */}
              <Card className="border border-gray-100 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                      <span className="text-3xl font-bold text-white">{evaluationResult.score}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Điểm số tổng thể: {evaluationResult.score}/100
                    </h3>
                    <div className="max-w-md mx-auto">
                      <Progress value={evaluationResult.score} className="h-3" />
                    </div>
                    <p className="text-gray-600 mt-2">
                      {evaluationResult.score >= 80 ? 'Xuất sắc' : 
                       evaluationResult.score >= 60 ? 'Tốt' : 
                       evaluationResult.score >= 40 ? 'Khá' : 'Cần cải thiện'}
                    </p>
                  </div>
                  
                  {/* Job Match Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                      <Target className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">Vị trí ứng tuyển</h4>
                    </div>
                    <p className="font-medium text-lg text-gray-900 mb-1">{evaluationResult.jobMatch.jobTitle}</p>
                    <p className="text-gray-600 mb-3">{evaluationResult.jobMatch.companyName}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Section */}
              <Card className="border border-white-200 bg-white-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Tóm tắt đánh giá</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {evaluationResult.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Điểm mạnh</h4>
                    </div>
                    <div className="space-y-2">
                      {evaluationResult.analysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Điểm cần cải thiện</h4>
                    </div>
                    <div className="space-y-2">
                      {evaluationResult.analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching Skills */}
                <Card className="border border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Kỹ năng phù hợp</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evaluationResult.analysis.matchingSkills.map((skill, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3 py-2 text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card className="border border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Kỹ năng cần bổ sung</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evaluationResult.analysis.missingSkills.map((skill, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-100 px-3 py-2 text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions */}
              <Card className="border border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Gợi ý cải thiện</h4>
                  </div>
                  <div className="space-y-3">
                    {evaluationResult.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Call to action */}
              <div className="text-center mt-8">
                <Button
                  onClick={() => {
                    setEvaluationResult(null);
                    setSelectedFile(null);
                    setJobTitle('');
                    setSelectedJob(null);
                    setJobs([]);
                  }}
                  variant="outline"
                  size="lg"
                  className="mr-4"
                >
                  Đánh giá CV khác
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
