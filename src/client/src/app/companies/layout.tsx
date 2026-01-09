import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách công ty - Jobify",
  description: "Khám phá các công ty hàng đầu và cơ hội việc làm tại Jobify",
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
