"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/utils/toast";

// Standalone register page component that bypasses root layout
export default function CandidateRegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!formData.fullName.trim()) {
      showToast.error("Vui lòng nhập họ và tên!");
      return false;
    }

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

    // Kiểm tra tên có ít nhất 2 từ
    if (formData.fullName.trim().split(' ').length < 2) {
      showToast.error("Vui lòng nhập đầy đủ họ và tên!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (success) {
        // Reset form sau khi thành công
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: ""
        });
        
        // Redirect về trang chủ sau khi đăng ký thành công
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error) {
      // Error đã được xử lý trong AuthContext
      console.error('Register error:', error);
    }
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        
        body > div {
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* Hide any existing navbar/footer */
        header, nav, footer {
          display: none !important;
        }
      `}</style>
      
      <div 
        className="w-screen h-screen flex items-center justify-center relative"
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
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
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
                  Tạo tài khoản ứng viên
                </h1>
                <p className="text-gray-600 text-sm">
                  Cùng xây dựng một hồ sơ nổi bật và nhận được các{" "}
                  <span className="sm:block">cơ hội sự nghiệp lý tương</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Full Name Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Họ và tên"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      style={{ borderColor: "#e5e7eb" }}
                    />
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
                      className="pl-10 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                      className="pl-10 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                      className="pl-10 pr-10 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                      className="pl-10 pr-10 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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

                  {/* Register Button */}
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>

                  {/* Login Link */}
                <div className="text-center">
                  <span className="text-gray-600 text-sm">
                    Bạn đã có tài khoản? {" "}
                    <Link 
                      href="/login" 
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
