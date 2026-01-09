'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, 
  Users, 
  Globe, 
  Heart, 
  MoreHorizontal, 
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
import { UserAvatar } from '@/components/UserAvatar';
import { useUserById } from '@/hooks/useUserById';

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

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  
  const { data: userProfile, isLoading: profileLoading, error } = useUserById(userId);

  // Handle keyword click
  const handleKeywordClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const keywords = [
    "JavaScript", "React", "Node.js", "Python", "Java", "PHP",
    "Marketing", "Thiết kế", "Kế toán", "Nhân sự", "Bán hàng", "Tư vấn", 
    "Quản lý", "Phát triển", "Kỹ thuật", "Y tế", "Giáo dục", "Luật",
    "Sản xuất", "Dịch vụ"
  ];

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

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            Quay lại
          </Button>
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
                    name: userProfile.name || 'Người dùng', 
                    avatarPic: userProfile.avatarPic
                  }} 
                  size="xl"
                  className="w-32 h-32 border-4 border-white shadow-lg"
                />
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ứng viên</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{userProfile.name || 'Người dùng'}</h1>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Hồ sơ công khai</span>
                      </div>
                      {userProfile.birthDay && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Sinh {formatDateForDisplay(userProfile.birthDay)}</span>
                        </div>
                      )}
                      {userProfile.provinceName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{userProfile.provinceName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => router.back()}
                    className="px-6"
                  >
                    Quay lại
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Chỉ có 1 tab Giới thiệu */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  className="py-4 px-1 border-b-2 border-primary text-primary font-medium text-sm"
                >
                  Giới thiệu
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-2 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Giới thiệu */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Giới thiệu</h2>
                </div>
                
                <div className="text-gray-600 leading-relaxed">
                  {!userProfile.intro || userProfile.intro.trim() === "" ? (
                    <span className="text-gray-400 italic">Chưa có thông tin giới thiệu</span>
                  ) : (
                    <div
                      className="user-intro-content"
                      dangerouslySetInnerHTML={{ __html: userProfile.intro }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
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
                    <span className="text-sm">{userProfile.email || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userProfile.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{userProfile.provinceName || userProfile.provinceFullName || 'Chưa cập nhật'}</span>
                  </div>
                  {userProfile.sex && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{userProfile.sex}</span>
                    </div>
                  )}
                  {userProfile.linkSocial && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Facebook className="w-4 h-4" />
                      <a 
                        href={userProfile.linkSocial.startsWith('http') ? userProfile.linkSocial : `https://${userProfile.linkSocial}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline break-all"
                      >
                        {userProfile.linkSocial}
                      </a>
                    </div>
                  )}
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









































