import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân - Jobify',
  description: 'Quản lý hồ sơ cá nhân và thông tin ứng viên trên Jobify',
};

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

