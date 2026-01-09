import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập ứng viên - Jobify",
  description: "Đăng nhập tài khoản ứng viên Jobify để tìm kiếm việc làm và quản lý hồ sơ của bạn",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

