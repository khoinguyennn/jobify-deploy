import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký ứng viên - Jobify",
  description: "Tạo tài khoản ứng viên trên Jobify để tìm kiếm công việc mơ ước của bạn",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
