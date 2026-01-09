"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  MapPin, 
  Search, 
  Building, 
  LogOut, 
  User, 
  FileText, 
  Briefcase, 
  Heart, 
  Lock,
  ChevronDown,
  Bot
} from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const { user, company, isAuthenticated, logout, isLoading, userType, avatarUpdateTime } = useAuth();
  
  // Get current account (user or company)
  const currentAccount = userType === 'company' ? company : user;

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/fields", label: "Ngành nghề/Địa điểm", icon: MapPin },
    { href: "/search", label: "Tìm kiếm", icon: Search },
    { href: "/companies", label: "Công ty", icon: Building },
    { href: "/cv-evaluation", label: "Đánh giá CV với AI", icon: Bot },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white -mx-8 lg:-mx-16">
      <div className="container mx-auto px-12 lg:px-20 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Jobify Logo" width={32} height={32} className="object-contain" />
            <span className="text-2xl font-bold text-primary">Jobify</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground"
                  )}
                >
                  <IconComponent 
                    className={cn(
                      "w-4 h-4 transition-colors group-hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated && currentAccount ? (
              // Hiển thị khi đã đăng nhập - Notification + Dropdown Menu
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Dropdown Menu */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 hover:bg-primary/10 px-3 py-2 h-auto"
                  >
                    <UserAvatar 
                      user={userType === 'company' ? {
                        name: company?.nameCompany || '',
                        avatarPic: company?.avatarPic
                      } : user} 
                      size="md" 
                      showFallbackIcon={false}
                      className="border-2 border-primary/20"
                      forceRefresh={avatarUpdateTime}
                    />
                    <span className="font-medium text-gray-700 max-w-[120px] truncate">
                      {userType === 'company' ? company?.nameCompany : user?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userType === 'company' ? company?.nameCompany : user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userType === 'company' ? company?.email : user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {userType === 'company' ? (
                    // Menu cho nhà tuyển dụng
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/company/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Trang cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/company/profile?tab=thong-tin" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Thông tin cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/company/applications" className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Đơn ứng tuyển</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/company/jobs/create" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Đăng ứng tuyển</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/company/profile?tab=doi-mat-khau" className="flex items-center">
                          <Lock className="mr-2 h-4 w-4" />
                          <span>Đổi mật khẩu</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    // Menu cho ứng viên
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Trang cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile?tab=thong-tin" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Thông tin cá nhân</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile?tab=ung-tuyen" className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Ứng tuyển</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile?tab=viec-lam" className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Việc làm đã lưu</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild>
                        <Link href="/user/profile?tab=theo-doi" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Theo dõi</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <>
                <Button variant="ghost" className="hover:bg-primary/10" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/employer/login">Nhà tuyển dụng</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
