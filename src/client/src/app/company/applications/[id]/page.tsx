"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Mail, Phone, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { UserAvatar } from "@/components/UserAvatar";
import { useUpdateApplicationStatus, ApplicationStatusMap } from "@/hooks/useCompanyApplications";
import { showToast } from "@/utils/toast";

interface ApplicationDetail {
  id: number;
  idJob: number;
  idUser: number;
  name: string;
  email: string;
  phone: string;
  letter?: string;
  cv?: string;
  status: number;
  createdAt: string;
  deletedAt?: string;
  // Thông tin từ job (flat structure)
  nameJob: string;
  // Thông tin từ user (flat structure)
  avatarPic?: string;
  sex?: string;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = parseInt(params.id as string);

  // Mutations
  const updateStatusMutation = useUpdateApplicationStatus();

  // Fetch application detail
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application-detail', applicationId],
    queryFn: async (): Promise<ApplicationDetail> => {
      const response = await apiClient.get(`/apply/${applicationId}`);
      return response.data.data;
    },
    enabled: !!applicationId,
  });

  // Handle status change
  const handleStatusChange = (newStatus: number) => {
    updateStatusMutation.mutate({
      applicationId,
      status: newStatus
    });
  };

  // Handle CV download
  const handleDownloadCV = () => {
    if (application?.cv) {
      // Create download link
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/uploads/cvs/${application.cv}`;
      link.download = `CV_${application.name}_${application.nameJob || 'Job'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Đang tải thông tin ứng tuyển...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không thể tải thông tin ứng tuyển</p>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          {/* Left side - Back button */}
          <div className="flex-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/company/applications')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Button>
          </div>
          
          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn ứng tuyển</h1>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Status Update */}
            <Select
              value={application.status.toString()}
              onValueChange={(value) => handleStatusChange(parseInt(value))}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-40">
                <Badge 
                  className={`text-sm px-3 py-1 ${ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.color || 'bg-gray-100 text-gray-700'}`}
                >
                  {ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.label || 'Không xác định'}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ApplicationStatusMap).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <Badge className={`text-sm px-3 py-1 ${config.color}`}>
                      {config.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Download CV */}
            {application.cv && (
              <Button onClick={handleDownloadCV} className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Tải CV
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin ứng viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-6">
                  <UserAvatar 
                    user={{ 
                      name: application.name, 
                      avatarPic: application.avatarPic 
                    }} 
                    size="lg"
                    className="w-20 h-20"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{application.email}</span>
                      </div>
                      {application.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{application.phone}</span>
                        </div>
                      )}
                      {application.sex && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-gray-500">Giới tính:</span>
                          <span>{application.sex}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.letter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Thư xin việc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: application.letter }}
                  />
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin ứng tuyển</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Vị trí ứng tuyển:</span>
                  <p className="font-medium text-primary">{application.nameJob}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày ứng tuyển:</span>
                  <p className="font-medium">{formatDate(application.createdAt)}</p>
                </div>
                {application.deletedAt && (
                  <div>
                    <span className="text-sm text-gray-600">Bị ẩn lúc:</span>
                    <p className="font-medium">{formatDate(application.deletedAt)}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Trạng thái hiện tại: </span>
                  <Badge 
                    className={`mt-1 ${ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.color || 'bg-gray-100 text-gray-700'}`}
                  >
                    {ApplicationStatusMap[application.status as keyof typeof ApplicationStatusMap]?.label || 'Không xác định'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${application.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi email
                </Button>
                
                {application.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${application.phone}`, '_blank')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi điện thoại
                  </Button>
                )}

                {application.cv && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleDownloadCV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải CV
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Bạn có thể thay đổi trạng thái ứng tuyển ở phần trên để theo dõi tiến trình tuyển dụng.
                </p>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
