import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký nhà tuyển dụng - Jobify",
  description: "Tạo tài khoản nhà tuyển dụng trên Jobify để đăng tin tuyển dụng và tìm kiếm ứng viên tài năng nhất",
};

export default function EmployerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
