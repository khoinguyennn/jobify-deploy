"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, Building, User, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProvinces } from "@/hooks/useProvinces";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

// Standalone employer register page component that bypasses root layout
export default function EmployerRegisterPage() {
  const router = useRouter();
  const { registerCompany } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Thông tin đăng nhập
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Thông tin công ty
    companyName: "",
    representativeName: "",
    companySize: "",
    companyAddress: "" // Sẽ lưu ID của province
  });
  const [isLoading, setIsLoading] = useState(false);

  // Lấy dữ liệu provinces từ API
  const { data: provincesResponse, isLoading: provincesLoading, error: provincesError } = useProvinces();
  
  // Đảm bảo provinces luôn là array
  const provinces = provincesResponse?.data || [];

  // Hiển thị lỗi nếu không thể tải provinces
  useEffect(() => {
    if (provincesError) {
      showToast.error("Không thể tải danh sách tỉnh thành. Vui lòng thử lại!");
    }
  }, [provincesError]);

  // Data cho dropdown
  const companySizes = [
    { value: "ít hơn 10", label: "ít hơn 10 nhân viên" },
    { value: "10 - 20", label: "10 - 20 nhân viên" },
    { value: "20 - 100", label: "20 - 100 nhân viên" },
    { value: "100 - 500", label: "100 - 500 nhân viên" },
    { value: "500 - 1000", label: "500 - 1000 nhân viên" },
    { value: "1000 - 5000", label: "1000 - 5000 nhân viên" },
    { value: "nhiều hơn 5000", label: "nhiều hơn 5000 nhân viên" }
  ];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!formData.email.trim()) {
      showToast.error("Vui lòng nhập email!");
      return false;
    }

    if (!formData.phone.trim()) {
      showToast.error("Vui lòng nhập số điện thoại!");
      return false;
    }

    if (!formData.password) {
      showToast.error("Vui lòng nhập mật khẩu!");
      return false;
    }

    if (!formData.confirmPassword) {
      showToast.error("Vui lòng nhập lại mật khẩu!");
      return false;
    }

    if (!formData.companyName.trim()) {
      showToast.error("Vui lòng nhập tên công ty!");
      return false;
    }

    if (!formData.representativeName.trim()) {
      showToast.error("Vui lòng nhập tên người đại diện!");
      return false;
    }

    if (!formData.companySize) {
      showToast.error("Vui lòng chọn quy mô công ty!");
      return false;
    }

    // Province là optional theo API, nhưng nếu chọn thì phải hợp lệ
    if (formData.companyAddress) {
      const selectedProvinceId = parseInt(formData.companyAddress);
      if (isNaN(selectedProvinceId) || selectedProvinceId <= 0) {
        showToast.error("Địa chỉ công ty không hợp lệ!");
        return false;
      }
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast.error("Email không hợp lệ!");
      return false;
    }

    // Kiểm tra định dạng số điện thoại (10-11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      showToast.error("Số điện thoại không hợp lệ! (10-11 chữ số)");
      return false;
    }

    // Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6) {
      showToast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    // Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      showToast.error("Mật khẩu không khớp nhau!");
      return false;
    }

    // Kiểm tra tên người đại diện có ít nhất 2 từ
    if (formData.representativeName.trim().split(' ').length < 2) {
      showToast.error("Vui lòng nhập đầy đủ tên người đại diện!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Chuẩn bị dữ liệu theo format API
      const registerData = {
        nameCompany: formData.companyName,
        nameAdmin: formData.representativeName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        idProvince: formData.companyAddress ? parseInt(formData.companyAddress) : undefined, // Optional
        scale: formData.companySize,
      };

      // Gọi API đăng ký
      const success = await registerCompany(registerData);
      
      if (success) {
        // Reset form sau khi thành công
        setFormData({
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          representativeName: "",
          companySize: "",
          companyAddress: ""
        });
        
        // Redirect về trang chủ sau khi đăng ký thành công
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      showToast.error("Có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          overflow: auto !important;
        }
        
        body > div {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Hide any existing navbar/footer */
        header, nav, footer {
          display: none !important;
        }
        
        /* Radix UI Select specific styles */
        [data-radix-select-content] {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
          max-height: 200px;
          overflow-y: auto;
          padding: 4px;
        }
        
        [data-radix-select-item] {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }
        
        [data-radix-select-item]:hover,
        [data-radix-select-item][data-highlighted] {
          background-color: #f3f4f6;
        }
        
        [data-radix-select-trigger] {
          cursor: pointer;
        }
        
        [data-radix-select-trigger][data-state="open"] {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 1px #8b5cf6;
        }
        
        /* Ensure Radix portals work */
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }
        
        /* Fix for portal rendering */
        body > div[data-radix-portal] {
          z-index: 9999 !important;
        }
        
        /* Ensure dropdown can be clicked */
        [data-radix-select-content] {
          pointer-events: auto !important;
        }
        
        [data-radix-select-item] {
          pointer-events: auto !important;
        }
      `}</style>
      
      <div 
        className="w-screen h-screen flex items-center justify-center relative overflow-auto"
        style={{
          backgroundImage: "url('/bg-login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999
        }}
      >
        
        {/* Back to Home Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Trang chủ</span>
          </Link>
        </div>

        {/* Main Register Card */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-0.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <Image src="/logo.png" alt="Jobify Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">Jobify</span>
            </div>
          </div>

          {/* Register Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Đăng ký tài khoản nhà tuyển dụng
                </h1>
                <p className="text-gray-600 text-sm">
                  Tham gia Jobify để tìm kiếm và kết nối với{" "}
                  <span className="sm:block">những ứng viên tài năng nhất</span>
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Cột 1: Thông tin đăng nhập */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-purple-600" />
                        Thông tin đăng nhập
                      </h3>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cột 2: Thông tin công ty */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-purple-600" />
                        Thông tin công ty
                      </h3>
                    </div>

                    {/* Company Name Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        name="companyName"
                        placeholder="Tên công ty"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="pl-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    {/* Representative Name Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        name="representativeName"
                        placeholder="Tên người đại diện"
                        value={formData.representativeName}
                        onChange={handleInputChange}
                        className="pl-10 py-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        style={{ borderColor: "#e5e7eb" }}
                      />
                    </div>

                    {/* Company Size Select */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <div style={{ isolation: 'isolate' }}>
                        <Select 
                          value={formData.companySize} 
                          onValueChange={(value) => handleSelectChange("companySize", value)}
                        >
                          <SelectTrigger 
                            className="pl-10 py-2 border-gray-200 focus:border-purple-500" 
                            style={{ borderColor: "#e5e7eb" }}
                          >
                            <SelectValue placeholder="Chọn quy mô công ty" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {companySizes.map((size) => (
                              <SelectItem 
                                key={size.value} 
                                value={size.value}
                              >
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Company Address Select */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <div style={{ isolation: 'isolate' }}>
                        <Select 
                          value={formData.companyAddress} 
                          onValueChange={(value) => handleSelectChange("companyAddress", value)}
                          disabled={provincesLoading}
                        >
                          <SelectTrigger 
                            className="pl-10 py-2 border-gray-200 focus:border-purple-500" 
                            style={{ borderColor: "#e5e7eb" }}
                          >
                            <SelectValue 
                              placeholder={provincesLoading ? "Đang tải..." : "Chọn địa chỉ công ty"} 
                            />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {provinces.map((province) => (
                              <SelectItem key={province.id} value={province.id.toString()}>
                                {province.nameWithType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-md text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isLoading ? "rgba(139, 92, 246, 0.5)" : "rgba(139, 92, 246, 1)",
                      border: "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.9)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 1)";
                      }
                    }}
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-3">
                  <span className="text-gray-600 text-sm">
                    Bạn đã có tài khoản? {" "}
                    <Link 
                      href="/employer/login" 
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Đăng nhập ngay
                    </Link>
                  </span>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
