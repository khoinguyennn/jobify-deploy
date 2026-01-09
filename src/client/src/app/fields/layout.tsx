import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ngành nghề / Địa điểm - Jobify',
  description: 'Tìm kiếm việc làm nhanh theo ngành nghề và địa điểm. Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu tại Việt Nam.',
  keywords: 'tìm việc làm, ngành nghề, địa điểm, tỉnh thành, công nghệ thông tin, xây dựng, tài chính, y tế',
};

export default function NganhNgheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



