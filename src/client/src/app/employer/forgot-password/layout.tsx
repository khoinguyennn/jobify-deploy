import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu nhà tuyển dụng - Jobify",
  description: "Khôi phục mật khẩu tài khoản nhà tuyển dụng Jobify",
};

export default function EmployerForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
