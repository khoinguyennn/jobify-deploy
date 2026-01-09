import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm việc làm - Jobify",
  description: "Tìm kiếm việc làm nhanh theo ngành nghề và địa điểm. Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu tại Việt Nam.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
