'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useRouter, useParams } from 'next/navigation';
import { useFields } from '@/hooks/useFields';
import { useProvinces } from '@/hooks/useProvinces';
import { useJob, useUpdateJob } from '@/hooks/useJobs';
import { showToast } from '@/utils/toast';

interface JobFormData {
  // Thông tin tuyển dụng
  title: string;
  fieldId: number | null;
  locationId: number | null;
  
  // Yêu cầu chung
  gender: 'Nam' | 'Nữ' | 'Cả hai' | null;
  minAge: number | null;
  maxAge: number | null;
  negotiable: boolean;
  
  // Hình thức làm việc
  workType: 'Nhân viên chính thức' | 'Bán thời gian' | 'Tự do' | 'Thực tập' | null;
  
  // Bằng cấp
  education: 'Không yêu cầu' | 'Đại học' | 'Cao đẳng' | 'Trung cấp' | 'Trung học' | null;
  
  // Kinh nghiệm
  experience: 'Không yêu cầu' | '1 năm' | '1 - 2 năm' | '2 - 5 năm' | '5 - 10 năm' | 'Trên 10 năm' | null;
  
  // Rich text fields
  description: string;
  requirements: string;
  benefits: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = parseInt(params.id as string);
  
  const { data: fieldsResponse } = useFields();
  const { data: provincesResponse } = useProvinces();
  
  const fields = fieldsResponse?.data || [];
  const provinces = provincesResponse?.data || [];
  const { data: jobData, isLoading, error } = useJob(jobId);
  const updateJobMutation = useUpdateJob();
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    fieldId: null,
    locationId: null,
    gender: null,
    minAge: null,
    maxAge: null,
    negotiable: false,
    workType: null,
    education: null,
    experience: null,
    description: '',
    requirements: '',
    benefits: ''
  });

  // Populate form data when job data is loaded
  useEffect(() => {
    if (jobData) {
      setFormData({
        title: jobData.nameJob || '',
        fieldId: jobData.idField || null,
        locationId: jobData.idProvince || null,
        gender: (jobData.sex as any) || null,
        minAge: jobData.salaryMin || null,
        maxAge: jobData.salaryMax || null,
        negotiable: false, // This might need to be derived from salary data
        workType: (jobData.typeWork as any) || null,
        education: (jobData.education as any) || null,
        experience: (jobData.experience as any) || null,
        description: jobData.desc || '',
        requirements: jobData.request || '',
        benefits: jobData.other || ''
      });
    }
  }, [jobData]);

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      showToast.error('Vui lòng nhập chức danh tuyển dụng');
      return;
    }
    
    if (!formData.fieldId) {
      showToast.error('Vui lòng chọn loại ngành nghề');
      return;
    }
    
    if (!formData.locationId) {
      showToast.error('Vui lòng chọn địa chỉ làm việc');
      return;
    }

    if (!formData.description.trim()) {
      showToast.error('Vui lòng nhập mô tả công việc');
      return;
    }

    if (!formData.requirements.trim()) {
      showToast.error('Vui lòng nhập yêu cầu công việc');
      return;
    }

    // Additional validation for minimum length
    if (formData.title.trim().length < 5) {
      showToast.error('Tên công việc phải có ít nhất 5 ký tự');
      return;
    }

    if (formData.description.trim().length < 10) {
      showToast.error('Mô tả công việc phải có ít nhất 10 ký tự');
      return;
    }

    if (formData.requirements.trim().length < 10) {
      showToast.error('Yêu cầu công việc phải có ít nhất 10 ký tự');
      return;
    }

    try {
      // Prepare data for API (match backend schema)
      const jobUpdateData = {
        nameJob: formData.title.trim(),
        idField: formData.fieldId,
        idProvince: formData.locationId,
        sex: formData.gender || 'Không yêu cầu',
        salaryMin: formData.minAge || undefined,
        salaryMax: formData.maxAge || undefined,
        typeWork: formData.workType || 'Nhân viên chính thức',
        education: formData.education || 'Không yêu cầu',
        experience: formData.experience || 'Không yêu cầu',
        desc: formData.description.trim(),
        request: formData.requirements.trim(),
        other: formData.benefits.trim() || '',
      };

      await updateJobMutation.mutateAsync({ id: jobId, data: jobUpdateData });
      showToast.success('Cập nhật bài tuyển dụng thành công!');
      router.push('/company/profile'); // Redirect to company profile
    } catch (error: any) {
      console.error('Error updating job:', error);
      showToast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài tuyển dụng');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Không thể tải thông tin công việc</p>
          <Button onClick={() => router.back()} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">Chỉnh sửa bài tuyển dụng</h1>
            </div>
            <div className="w-20"></div> {/* Spacer để cân bằng */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          
          {/* Thông tin tuyển dụng */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Thông tin tuyển dụng</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Chức danh tuyển dụng
                </Label>
                <Input
                  id="title"
                  placeholder="Chức danh"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Loại ngành nghề
                  </Label>
                  <Select
                    value={formData.fieldId?.toString() || ''}
                    onValueChange={(value) => handleInputChange('fieldId', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id.toString()}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Địa chỉ làm việc
                  </Label>
                  <Select
                    value={formData.locationId?.toString() || ''}
                    onValueChange={(value) => handleInputChange('locationId', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn..." />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id.toString()}>
                          {province.nameWithType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yêu cầu chung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Yêu cầu chung</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Giới tính */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Giới tính
                </Label>
                <div className="flex gap-6">
                  {['Nam', 'Nữ', 'Cả hai'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mức lương theo tháng */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Mức lương theo tháng (từ 1 đến 100 triệu)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.minAge || ''}
                    onChange={(e) => handleInputChange('minAge', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-32"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.maxAge || ''}
                    onChange={(e) => handleInputChange('maxAge', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-32"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-500">triệu VNĐ</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => handleInputChange('negotiable', checked)}
                    />
                    <span className="text-sm text-gray-700">Thỏa thuận</span>
                  </label>
                </div>
              </div>

              {/* Hình thức làm việc */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Hình thức làm việc
                </Label>
                <div className="flex flex-wrap gap-4">
                  {['Nhân viên chính thức', 'Bán thời gian', 'Tự do', 'Thực tập'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="workType"
                        value={type}
                        checked={formData.workType === type}
                        onChange={(e) => handleInputChange('workType', e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bằng cấp */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Bằng cấp
                </Label>
                <div className="flex flex-wrap gap-4">
                  {['Không yêu cầu', 'Đại học', 'Cao đẳng', 'Trung cấp', 'Trung học'].map((edu) => (
                    <label key={edu} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="education"
                        value={edu}
                        checked={formData.education === edu}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">{edu}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Kinh nghiệm */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Kinh nghiệm
                </Label>
                <div className="flex flex-wrap gap-4">
                  {['Không yêu cầu', '1 năm', '1 - 2 năm', '2 - 5 năm', '5 - 10 năm', 'Trên 10 năm'].map((exp) => (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="experience"
                        value={exp}
                        checked={formData.experience === exp}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-gray-700">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mô tả công việc */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Mô tả công việc</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RichTextEditor
                content={formData.description}
                onChange={(content) => handleInputChange('description', content)}
                placeholder=""
                editable={true}
              />
            </CardContent>
          </Card>

          {/* Yêu cầu công việc */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Yêu cầu công việc</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RichTextEditor
                content={formData.requirements}
                onChange={(content) => handleInputChange('requirements', content)}
                placeholder=""
                editable={true}
              />
            </CardContent>
          </Card>

          {/* Thông tin khác */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RichTextEditor
                content={formData.benefits}
                onChange={(content) => handleInputChange('benefits', content)}
                placeholder=""
                editable={true}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center py-6">
            <Button
              onClick={handleSubmit}
              disabled={updateJobMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-md disabled:opacity-50"
            >
              {updateJobMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật bài'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
