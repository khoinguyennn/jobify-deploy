"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/utils/toast";
import { useCompanyResetPassword } from "@/hooks/useCompanyForgotPassword";

// Standalone reset password page component that bypasses root layout
export default function EmployerResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const resetPasswordMutation = useCompanyResetPassword();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!password) {
      showToast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    if (password.length < 6) {
      showToast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!confirmPassword) {
      showToast.error("Vui lòng xác nhận mật khẩu!");
      return;
    }

    if (password !== confirmPassword) {
      showToast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!token) {
      showToast.error("Token không hợp lệ!");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, password });
      
      // Redirect to login after success
      setTimeout(() => {
        router.push('/employer/login');
      }, 2000);
      
    } catch (error) {
      // Error đã được xử lý trong hook
      console.error('Company reset password error:', error);
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

        {/* Main Reset Password Card */}
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

          {/* Reset Password Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Đặt lại mật khẩu công ty
                </h1>
                <p className="text-gray-600 text-sm">
                  Nhập mật khẩu mới cho tài khoản công ty của bạn
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu mới"
                    value={password}
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
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
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

                {/* Reset Button */}
                <Button 
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: resetPasswordMutation.isPending ? "rgba(139, 92, 246, 0.5)" : "rgba(139, 92, 246, 1)",
                    border: "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!resetPasswordMutation.isPending) {
                      e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!resetPasswordMutation.isPending) {
                      e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 1)";
                    }
                  }}
                >
                  {resetPasswordMutation.isPending ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center">
                  <span className="text-gray-600 text-sm">
                    <Link 
                      href="/employer/login" 
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Quay về đăng nhập
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
