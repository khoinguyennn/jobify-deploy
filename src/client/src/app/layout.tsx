import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { NavBar } from "@/components/NavBar";
import { MainContent } from "@/components/MainContent";
import { Facebook, Twitter, Music, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Jobify - Tìm việc làm dễ dàng",
  description: "Nền tảng tìm việc làm hiện đại, kết nối ứng viên và nhà tuyển dụng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${roboto.variable} antialiased font-sans`}
      >
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="px-8 lg:px-16">
                {/* Header Navigation */}
                <NavBar />

                {/* Main Content */}
                <MainContent>
                  {children}
                </MainContent>

            {/* Footer */}
            <footer className="bg-muted py-12 -mx-8 lg:-mx-16">
              <div className="container mx-auto px-12 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Image src="/logo.png" alt="Jobify Logo" width={32} height={32} className="object-contain" />
                      <span className="text-2xl font-bold text-primary">Jobify</span>
                    </div>
                    <p className="text-muted-foreground">
                      Kết nối tài năng với cơ hội. Tìm kiếm công việc mơ ước của bạn.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        asChild
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <a href="https://facebook.com/jobify" target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-5 h-5" />
                        </a>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        asChild
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <a href="https://twitter.com/jobify" target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-5 h-5" />
                        </a>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        asChild
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <a href="https://tiktok.com/@jobify" target="_blank" rel="noopener noreferrer">
                          <Music className="w-5 h-5" />
                        </a>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        asChild
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <a href="mailto:contact@jobify.vn">
                          <Mail className="w-5 h-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground">Dành cho ứng viên</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><a href="#" className="hover:text-foreground">Tìm việc làm</a></li>
                      <li><a href="#" className="hover:text-foreground">Công ty</a></li>
                      <li><a href="#" className="hover:text-foreground">Cẩm nang nghề nghiệp</a></li>
                      <li><a href="#" className="hover:text-foreground">Công cụ tính lương</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground">Dành cho nhà tuyển dụng</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li><a href="#" className="hover:text-foreground">Đăng tin tuyển dụng</a></li>
                      <li><a href="#" className="hover:text-foreground">Tìm hồ sơ</a></li>
                      <li><a href="#" className="hover:text-foreground">Báo cáo thị trường</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground">Liên hệ</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Trà Vinh, Việt Nam</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">+84 987 769 860</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">info@jobify.vn</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
                  <p>&copy; 2025 Jobify. Đây là đồ án chuyên ngành của Trầm Khôi Nguyên.</p>
                </div>
              </div>
            </footer>
              </div>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
        
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
