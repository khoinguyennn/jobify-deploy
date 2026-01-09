"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: {
    name?: string;
    avatarPic?: string;
  } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallbackIcon?: boolean;
  forceRefresh?: boolean | number;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
  xl: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm", 
  lg: "text-base",
  xl: "text-lg"
};

export function UserAvatar({ 
  user, 
  size = "lg", 
  className,
  showFallbackIcon = true,
  forceRefresh = false
}: UserAvatarProps) {
  // Detect if custom large size is used (like w-32 h-32 in profile)
  const isLargeCustomSize = className?.includes('w-32') || className?.includes('h-32');
  // Tạo URL đầy đủ cho avatar nếu có
  const getAvatarUrl = (avatarPic?: string) => {
    if (!avatarPic) return null;
    
    // Nếu đã là URL đầy đủ thì return luôn
    if (avatarPic.startsWith('http')) {
      return avatarPic;
    }
    
    // Sử dụng Next.js proxy để bypass CORS
    // Proxy sẽ forward /api/uploads/* đến http://localhost:5000/uploads/*
    let url = `/api/uploads/${avatarPic}`;
    
    // Thêm cache busting nếu forceRefresh có giá trị
    if (forceRefresh && forceRefresh !== false) {
      const timestamp = typeof forceRefresh === 'number' ? forceRefresh : Date.now();
      url += `?t=${timestamp}`;
    }
    
    return url;
  };

  // Lấy initials từ tên user
  const getInitials = (name?: string) => {
    if (!name) return "";
    
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const avatarUrl = getAvatarUrl(user?.avatarPic);
  const initials = getInitials(user?.name);

  // Nếu có avatar, sử dụng Next.js Image trực tiếp để tránh cache issues
  if (avatarUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeClasses[size], className)}>
        <Image
          key={forceRefresh && forceRefresh !== false ? `avatar-${typeof forceRefresh === 'number' ? forceRefresh : Date.now()}` : `avatar-${user?.avatarPic}`}
          src={avatarUrl}
          alt={user?.name || "User avatar"}
          fill
          className="object-cover"
          unoptimized // Tắt optimization để tránh cache
        />
      </div>
    );
  }

  // Fallback khi không có avatar
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials ? (
          <span className={cn(
            isLargeCustomSize ? "text-2xl" : textSizeClasses[size], 
            "font-semibold"
          )}>{initials}</span>
        ) : (
          <>
            {showFallbackIcon ? (
              <User className={cn(
                size === "sm" ? "h-3 w-3" :
                size === "md" ? "h-4 w-4" :
                size === "lg" ? "h-5 w-5" :
                "h-6 w-6"
              )} />
            ) : (
              <Image 
                src="/avatar-default.png" 
                alt="Default avatar"
                width={size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 40 : 48}
                height={size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 40 : 48}
                className="object-cover rounded-full"
              />
            )}
          </>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
