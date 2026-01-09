'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Users, 
  Globe, 
  Edit, 
  Heart, 
  MoreHorizontal, 
  Camera, 
  Facebook, 
  Mail, 
  Loader2, 
  Briefcase,
  Eye,
  Building,
  Clock,
  DollarSign,
  Star,
  Phone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BirthDatePicker } from '@/components/ui/birth-date-picker';
import Image from 'next/image';
import { SavedJobButton } from '@/components/SavedJobButton';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUpdateUserProfile } from '@/hooks/useUpdateUserProfile';
import { useUpdateUserIntro } from '@/hooks/useUpdateUserIntro';
import { useUpdateUserAvatar } from '@/hooks/useUpdateUserAvatar';
import { useUpdateUserPassword } from '@/hooks/useUpdateUserPassword';
import { useApplicationsCount } from '@/hooks/useApplications';
import { useSavedJobs, useSavedJobsCount } from '@/hooks/useSavedJobs';
import { useFollowedCompanies, useFollowedCompaniesCount } from '@/hooks/useFollowedCompanies';
import { UserAvatar } from '@/components/UserAvatar';
import { RichTextEditor } from '@/components/RichTextEditor';
import ApplicationsList from '@/components/ApplicationsList';
import { showToast } from '@/utils/toast';
import { useProvinces } from '@/hooks/useProvinces';
import { FollowCompanyButton } from '@/components/FollowCompanyButton';

// Component để render field có thể edit
const EditableField = ({ 
  field, 
  label, 
  value, 
  type = "text",
  isLast = false,
  isEditing,
  isLoading,
  formData,
  onEdit,
  onCancel,
  onSave,
  onInputChange
}: { 
  field: string; 
  label: string; 
  value: string; 
  type?: "text" | "email" | "date";
  isLast?: boolean;
  isEditing: boolean;
  isLoading: boolean;
  formData: any;
  onEdit: (field: string) => void;
  onCancel: () => void;
  onSave: (field: string) => void;
  onInputChange: (field: string, value: string) => void;
}) => {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex-1 mr-4">
        <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type={type}
              value={formData[field] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(field, e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onSave(field)}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Lưu
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{value || 'Chưa cập nhật'}</p>
        )}
      </div>
      {!isEditing && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={() => onEdit(field)}
        >
          Thay đổi
        </Button>
      )}
    </div>
  );
};

// Component để render select field có thể edit
const EditableSelectField = ({ 
  field, 
  label, 
  value, 
  options,
  isLast = false,
  isEditing,
  isLoading,
  formData,
  onEdit,
  onCancel,
  onSave,
  onSelectChange,
  placeholder = "Chọn..."
}: { 
  field: string; 
  label: string; 
  value: string; 
  options: { value: string; label: string; }[];
  isLast?: boolean;
  isEditing: boolean;
  isLoading: boolean;
  formData: any;
  onEdit: (field: string) => void;
  onCancel: () => void;
  onSave: (field: string) => void;
  onSelectChange: (field: string, value: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex-1 mr-4">
        <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
        {isEditing ? (
          <div className="space-y-2">
            <Select
              value={formData[field]?.toString() || ""}
              onValueChange={(value) => onSelectChange(field, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onSave(field)}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Lưu
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{value || 'Chưa cập nhật'}</p>
        )}
      </div>
      {!isEditing && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={() => onEdit(field)}
        >
          Thay đổi
        </Button>
      )}
    </div>
  );
};

// Utility function to convert API date to display format
const formatDateForDisplay = (apiDate: string | undefined): string => {
  if (!apiDate) return '';
  
  let dateStr = apiDate.toString();
  
  // Handle ISO string format like "2004-01-27T00:00:00.000Z"
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  
  // Handle datetime format like "1990-01-01 07:00:00"
  if (dateStr.includes(' ')) {
    dateStr = dateStr.split(' ')[0];
  }
  
  // Handle YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  
  // If already in dd/mm/yyyy format, return as is
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateStr;
  }
  
  // Return empty string if format is not recognized
  return '';
};

// Component để render date field có thể edit
const EditableDateField = ({ 
  field, 
  label, 
  value, 
  isLast = false,
  isEditing,
  isLoading,
  formData,
  onEdit,
  onCancel,
  onSave,
  onDateChange,
  placeholder = "Chọn ngày sinh"
}: { 
  field: string; 
  label: string; 
  value: string; 
  isLast?: boolean;
  isEditing: boolean;
  isLoading: boolean;
  formData: any;
  onEdit: (field: string) => void;
  onCancel: () => void;
  onSave: (field: string) => void;
  onDateChange: (field: string, date: Date | undefined) => void;
  placeholder?: string;
}) => {
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    // If already in dd/mm/yyyy format, return as is
    if (dateString.includes('/')) return dateString;
    
    // Use the utility function to avoid timezone issues
    return formatDateForDisplay(dateString);
  };

  const parseFormDate = (dateString: string) => {
    if (!dateString) return undefined;
    
    // If in dd/mm/yyyy format, parse manually to avoid timezone issues
    if (dateString.includes('/')) {
      const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (match) {
        const [, day, month, year] = match;
        // Create date at noon to avoid timezone issues
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0, 0);
      }
    }
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch (error) {
      return undefined;
    }
  };

  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex-1 mr-4">
        <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
        {isEditing ? (
          <div className="space-y-2">
            <BirthDatePicker
              date={parseFormDate(formData[field])}
              onDateChange={(date) => onDateChange(field, date)}
              placeholder={placeholder}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onSave(field)}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Lưu
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{value || 'Chưa cập nhật'}</p>
        )}
      </div>
      {!isEditing && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={() => onEdit(field)}
        >
          Thay đổi
        </Button>
      )}
    </div>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'gioi-thieu';

  // Handle company click
  const handleCompanyClick = (companyId: number) => {
    router.push(`/companies/${companyId}`);
  };

  // Handle keyword click
  const handleKeywordClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };
  
  const { user, avatarUpdateTime } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  
  const userId = user?.id || userProfile?.id || 0;
  const updateProfileMutation = useUpdateUserProfile(userId);
  const updateIntroMutation = useUpdateUserIntro(userId);
  const updateAvatarMutation = useUpdateUserAvatar();
  const updatePasswordMutation = useUpdateUserPassword();
  const { data: applicationsCount } = useApplicationsCount();
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();
  const { data: followedCompanies, isLoading: followedLoading } = useFollowedCompanies();
  const { data: savedJobsCount } = useSavedJobsCount();
  const { data: followedCompaniesCount } = useFollowedCompaniesCount();
  const { data: provincesResponse, isLoading: provincesLoading } = useProvinces();
  const provinces = provincesResponse?.data || [];


  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (userProfile) {
      console.log('UserProfile updated:', userProfile); // Debug
      console.log('Birth date from userProfile:', userProfile.birthDay); // Debug
      setBioContent(userProfile.intro || '');
    }
  }, [userProfile]);

  const tabs = [
    { id: 'gioi-thieu', label: 'Giới thiệu' },
    { id: 'thong-tin', label: 'Thông tin' },
    { id: 'doi-mat-khau', label: 'Đổi mật khẩu' },
    { id: 'ung-tuyen', label: 'Ứng tuyển' },
    { id: 'viec-lam', label: 'Việc làm' },
    { id: 'theo-doi', label: 'Theo dõi' }
  ];

  const handleTabClick = (tabId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.push(url.pathname + url.search);
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const handleSaveBio = async () => {
    try {
      await updateIntroMutation.mutateAsync(bioContent);
      setIsEditingBio(false);
      showToast.success('Cập nhật giới thiệu thành công!');
    } catch (error) {
      console.error('Error updating bio:', error);
      showToast.error('Có lỗi xảy ra khi cập nhật giới thiệu!');
    }
  };

  const handleCancelBio = () => {
    setBioContent(userProfile?.intro || '');
    setIsEditingBio(false);
  };


  const handleUpdateProfile = () => {
    // TODO: Implement profile update API call
    console.log('Updating profile:', userProfile);
    showToast.success('Cập nhật thông tin thành công!');
  };

  // Xử lý editing fields
  const handleEdit = (field: string) => {
    setEditingField(field);
    
    // Convert birthDate for editing
    const editBirthDate = formatDateForDisplay(userProfile?.birthDay);
    
    // Sử dụng dữ liệu từ userProfile với fallback từ user
    const currentData = {
      fullName: userProfile?.name || user?.name || '',
      birthDate: editBirthDate,
      gender: userProfile?.sex || '',
      email: userProfile?.email || user?.email || '',
      facebook: userProfile?.linkSocial || '',
      phone: userProfile?.phone || '',
      address: '', // Not available in backend
      idProvince: userProfile?.idProvince?.toString() || '',
      bio: userProfile?.intro || '',
      experience: '', // Not available in backend
      education: '' // Not available in backend
    };
    setFormData(currentData);
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
  };

  const handleSave = async (field: string) => {
    try {
      const updateData: any = {};
      
      // Map frontend field names to backend API field names
      switch (field) {
        case 'fullName':
          updateData.name = formData[field];  // fullName → name
          break;
        case 'birthDate':
          // Convert dd/mm/yyyy to YYYY-MM-DD format
          const dateValue = formData[field];
          if (dateValue && dateValue.includes('/')) {
            const [day, month, year] = dateValue.split('/');
            updateData.birthDay = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            updateData.birthDay = dateValue;  // birthDate → birthDay
          }
          break;
        case 'gender':
          updateData.sex = formData[field];  // gender → sex
          break;
        case 'email':
          updateData.email = formData[field];
          break;
        case 'facebook':
          updateData.linkSocial = formData[field];  // facebook → linkSocial
          break;
        case 'phone':
          updateData.phone = formData[field];
          break;
        case 'idProvince':
          updateData.idProvince = parseInt(formData[field]);
          break;
        default:
          updateData[field] = formData[field];
      }

      console.log('Sending update data:', updateData); // Debug
      const result = await updateProfileMutation.mutateAsync(updateData);
      console.log('Update result:', result); // Debug
      
      setEditingField(null);
      setFormData({});
      showToast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (!date) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    // Convert Date to dd/mm/yyyy format to avoid timezone issues
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const formattedDate = `${day}/${month}/${year}`;
    
    
    setFormData((prev: any) => ({
      ...prev,
      [field]: formattedDate // Store as dd/mm/yyyy
    }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    try {
      await updateAvatarMutation.mutateAsync({ id: userId, file });
      showToast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện!');
    }

    // Reset input value để có thể chọn lại cùng file
    event.target.value = '';
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (!userId) {
      showToast.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePasswordMutation.mutateAsync({
        id: userId,
        data: passwordData
      });
      
      // Reset form sau khi thành công
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      // Error handling được xử lý trong hook
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Format functions
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} tháng trước`;
    return `${Math.ceil(diffDays / 365)} năm trước`;
  };

  const keywords = [
    "JavaScript", "React", "Node.js", "Python", "Java", "PHP",
    "Marketing", "Thiết kế", "Kế toán", "Nhân sự", "Bán hàng", "Tư vấn", 
    "Quản lý", "Phát triển", "Kỹ thuật", "Y tế", "Giáo dục", "Luật",
    "Sản xuất", "Dịch vụ"
  ];

  const genderOptions = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" },
    { value: "Khác", label: "Khác" }
  ];

  // Chuẩn bị dữ liệu provinces cho select
  const provincesArray = Array.isArray(provinces) ? provinces : [];
  const provinceOptions = provincesArray.map((province: any) => ({
    value: province.id.toString(),
    label: province.nameWithType
  }));

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profileLoading && !userProfile && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        {/* User Info */}
        <div className="bg-white pt-6">
          <div className="max-w-6xl mx-auto px-2">
            <div className="flex items-start gap-6 pb-6">
              {/* User Avatar */}
              <div className="relative">
                <UserAvatar 
                  user={{ 
                    name: userProfile?.name || user?.name || 'Người dùng', 
                    avatarPic: userProfile?.avatarPic || user?.avatarPic
                  }} 
                  size="xl"
                  className="w-32 h-32 border-4 border-white shadow-lg"
                  forceRefresh={avatarUpdateTime}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <button 
                  className="absolute bottom-2 right-2 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thay đổi ảnh đại diện"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={updateAvatarMutation.isPending}
                >
                  {updateAvatarMutation.isPending ? (
                    <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  )}
                </button>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ứng viên</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{userProfile?.name || user?.name || 'Người dùng'}</h1>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{applicationsCount || 0} ứng tuyển</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{savedJobsCount?.count || 0} việc làm đã lưu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>{followedCompaniesCount?.count || 0} công ty theo dõi</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                    onClick={() => handleTabClick("thong-tin")}
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
            {activeTab === "gioi-thieu" && (
              <>
                {/* Giới thiệu bản thân */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Giới thiệu</h2>
                      {!isEditingBio ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary/80"
                          onClick={handleEditBio}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={handleSaveBio}
                            disabled={updateIntroMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {updateIntroMutation.isPending ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Đang lưu...
                              </>
                            ) : (
                              'Lưu'
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelBio}
                          >
                            Hủy
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingBio ? (
                      <RichTextEditor
                        content={bioContent}
                        onChange={setBioContent}
                        placeholder=""
                        className="min-h-[300px]"
                      />
                    ) : (
                      <div className="text-gray-600 leading-relaxed">
                        {!userProfile?.intro || userProfile.intro.trim() === "" ? (
                          <span className="text-gray-400 italic">Chưa có thông tin giới thiệu</span>
                        ) : (
<div className="text-gray-600 leading-relaxed">
  {!userProfile?.intro || userProfile.intro.trim() === "" ? (
    <span className="text-gray-400 italic">Chưa có thông tin giới thiệu</span>
  ) : (
    <div
      className="user-intro-content"
      dangerouslySetInnerHTML={{ __html: userProfile.intro }}
    />
  )}
</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </>
            )}

            {activeTab === "thong-tin" && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-0">
                    <EditableField
                      field="fullName"
                      label="Tên"
                      value={userProfile?.name || user?.name || ""}
                      isEditing={editingField === "fullName"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onInputChange={handleInputChange}
                    />
                    <EditableDateField
                      field="birthDate"
                      label="Ngày sinh"
                      value={formatDateForDisplay(userProfile?.birthDay) || ""}
                      isEditing={editingField === "birthDate"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onDateChange={handleDateChange}
                      placeholder="Chọn ngày sinh"
                    />
                    <EditableSelectField
                      field="gender"
                      label="Giới tính"
                      value={userProfile?.sex || ""}
                      options={genderOptions}
                      isEditing={editingField === "gender"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onSelectChange={handleSelectChange}
                      placeholder="Chọn giới tính"
                    />
                    <EditableField
                      field="email"
                      label="Email"
                      value={userProfile?.email || user?.email || ""}
                      type="email"
                      isEditing={editingField === "email"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      field="facebook"
                      label="Liên kết facebook"
                      value={userProfile?.linkSocial || ""}
                      isEditing={editingField === "facebook"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onInputChange={handleInputChange}
                    />
                    <EditableField
                      field="phone"
                      label="Số điện thoại"
                      value={userProfile?.phone || ""}
                      isEditing={editingField === "phone"}
                      isLoading={updateProfileMutation.isPending}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onInputChange={handleInputChange}
                    />
                    <EditableSelectField
                      field="idProvince"
                      label="Địa chỉ"
                      value={userProfile?.provinceName || userProfile?.provinceFullName || ""}
                      options={provinceOptions}
                      isLast={true}
                      isEditing={editingField === "idProvince"}
                      isLoading={provincesLoading}
                      formData={formData}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      onSelectChange={handleSelectChange}
                      placeholder="Chọn tỉnh thành"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "doi-mat-khau" && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Mật khẩu hiện tại */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full"
                      />
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        className="w-full"
                      />
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full"
                      />
                    </div>

                    {/* Nút hành động */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword || updatePasswordMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {(isChangingPassword || updatePasswordMutation.isPending) ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang cập nhật...
                          </>
                        ) : (
                          'Đổi mật khẩu'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        })}
                        disabled={isChangingPassword}
                      >
                        Hủy bỏ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "ung-tuyen" && (
              <Card>
                <CardContent className="p-6">
                  <ApplicationsList limit={10} page={1} />
                </CardContent>
              </Card>
            )}

            {activeTab === "viec-lam" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Việc làm đã lưu</h2>
                  
                  {savedJobsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-gray-600">Đang tải...</span>
                      </div>
                    </div>
                  ) : savedJobs && savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((savedJob: any) => (
                        <Card 
                          key={savedJob.id} 
                          className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => router.push(`/jobs/${savedJob.job?.id}`)}
                        >
                          <CardHeader className="flex flex-row items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                                {savedJob.job?.company?.avatarPic ? (
                                  <>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Building className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <Image
                                      src={`/api/uploads/${savedJob.job.company.avatarPic}`}
                                      alt={`${savedJob.job.company.nameCompany} logo`}
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
                                <CardTitle className="text-lg">{savedJob.job?.nameJob}</CardTitle>
                                <CardDescription>{savedJob.job?.company?.nameCompany}</CardDescription>
                              </div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <SavedJobButton jobId={savedJob.job?.id} />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {savedJob.job?.province?.nameWithType || 'Không xác định'}
                              </span>
                              <span>{formatSalary(savedJob.job?.salaryMin, savedJob.job?.salaryMax)}</span>
                              <span>{savedJob.job?.experience}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" onClick={(e) => e.stopPropagation()}>
                                {savedJob.job?.typeWork}
                              </Badge>
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Handle apply job functionality
                                }}
                              >
                                {/* <Briefcase className="w-4 h-4 mr-2" /> */}
                                Ứng tuyển
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có việc làm nào được lưu
                      </h3>
                      <p className="text-gray-600">
                        Lưu các công việc yêu thích để xem lại sau!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "theo-doi" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Công ty đang theo dõi</h2>
                  
                  {followedLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-gray-600">Đang tải...</span>
                      </div>
                    </div>
                  ) : followedCompanies && followedCompanies.length > 0 ? (
                    <div className="space-y-4">
                      {followedCompanies.map((follow: any) => (
                        <Card key={follow.id} className="bg-card border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCompanyClick(follow.company?.id)}>
                          <CardHeader className="flex flex-row items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                                {follow.company?.avatarPic ? (
                                  <>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Building className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <Image
                                      src={`/api/uploads/${follow.company.avatarPic}`}
                                      alt={`${follow.company.nameCompany} logo`}
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
                                <CardTitle className="text-lg">{follow.company?.nameCompany}</CardTitle>
                                <CardDescription>{follow.company?.province?.nameWithType || 'Không xác định'}</CardDescription>
                              </div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <FollowCompanyButton companyId={follow.company?.id} />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {follow.company?.province?.nameWithType || 'Không xác định'}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                {follow.company?.jobCount || 0} việc làm
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {follow.company?.scale || 'Không xác định'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Đang theo dõi</Badge>
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompanyClick(follow.company?.id);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem công ty
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa theo dõi công ty nào
                      </h3>
                      <p className="text-gray-600">
                        Theo dõi các công ty để cập nhật tin tuyển dụng mới nhất!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Thông tin liên hệ */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{userProfile?.email || user?.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userProfile?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{userProfile?.provinceName || userProfile?.provinceFullName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Facebook className="w-4 h-4" />
                    {userProfile?.linkSocial ? (
                      <a 
                        href={userProfile.linkSocial.startsWith('http') ? userProfile.linkSocial : `https://${userProfile.linkSocial}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        {userProfile.linkSocial}
                      </a>
                    ) : (
                      <span className="text-sm">Chưa cập nhật</span>
                    )}
                  </div>
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
