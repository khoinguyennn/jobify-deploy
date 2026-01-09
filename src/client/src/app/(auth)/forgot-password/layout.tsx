import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu - Jobify",
  description: "Khôi phục mật khẩu tài khoản ứng viên Jobify",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
