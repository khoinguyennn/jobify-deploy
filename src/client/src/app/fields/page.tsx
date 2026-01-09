'use client';

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useFieldsByType } from "@/hooks/useFieldsByType";
import { useProvincesByType } from "@/hooks/useProvincesByType";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function NganhNghePage() {
  const router = useRouter();
  const { data: fieldsData, isLoading: isLoadingFields } = useFieldsByType();
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvincesByType();

  // Handle field search
  const handleFieldSearch = (fieldId: number, fieldName: string) => {
    router.push(`/search?field=${fieldId}`);
  };

  // Handle province search
  const handleProvinceSearch = (provinceId: number, provinceName: string) => {
    router.push(`/search?location=${provinceId}`);
  };

  // Group provinces by first letter
  const groupProvincesByLetter = (provinces: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    provinces.forEach(province => {
      const firstLetter = province.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(province);
    });

    // Sort by letter and sort provinces within each group
    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        letter,
        cities: grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
      }));
  };

  // Get all provinces (municipalities + provinces)
  const allProvinces = provincesData?.data 
    ? [...provincesData.data.municipalities, ...provincesData.data.provinces]
    : [];

  const groupedProvinces = groupProvincesByLetter(allProvinces);

  // Get popular fields (top 10 by job count)
  const popularFields = fieldsData?.data 
    ? Object.values(fieldsData.data)
        .flat()
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 10)
    : [];


  const suggestedKeywords = [
    "Nhân sự", "Phát triển", "Quản lý", "Kế toán", "Kỹ thuật", "Thiết kế",
    "Marketing", "Bán hàng", "Hỗ trợ", "Tư vấn", "IT", "Nghiên cứu", "Y tế",
    "Luật", "Sản xuất", "Dịch vụ", "Nghệ thuật", "Xây dựng", "Giáo dục", "Nông nghiệp"
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Tìm kiếm việc làm nhanh</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cột trái - Danh mục nghề nghiệp và tỉnh thành */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tìm kiếm theo ngành nghề */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tìm kiếm việc làm nhanh theo ngành nghề</h2>
                
                {isLoadingFields ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-1">
                          {Array.from({ length: 4 }).map((_, jobIndex) => (
                            <Skeleton key={jobIndex} className="h-4 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fieldsData?.data && Object.entries(fieldsData.data).map(([typeField, fields]) => (
                      <div key={typeField} className="space-y-2">
                        <h3 className="font-semibold text-primary">
                          {typeField}
                        </h3>
                        <ul className="space-y-1">
                          {fields.map((field) => (
                            <li key={field.id}>
                              <button
                                onClick={() => handleFieldSearch(field.id, field.name)}
                                className="text-sm text-gray-600 hover:text-primary transition-colors text-left w-full"
                              >
                                {field.name} ({field.jobCount})
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tìm kiếm theo tỉnh */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tìm kiếm việc làm nhanh theo tỉnh</h2>
                
                {isLoadingProvinces ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-6 w-8" />
                        <div className="space-y-1">
                          {Array.from({ length: 3 }).map((_, cityIndex) => (
                            <Skeleton key={cityIndex} className="h-4 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {groupedProvinces.map((provinceGroup, index) => (
                      <div key={index} className="space-y-2">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {provinceGroup.letter}
                        </h3>
                        <ul className="space-y-1">
                          {provinceGroup.cities.map((city) => (
                            <li key={city.id}>
                              <button
                                onClick={() => handleProvinceSearch(city.id, city.name)}
                                className="text-sm text-gray-600 hover:text-primary transition-colors text-left w-full"
                              >
                                {city.name} ({city.jobCount})
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cột phải - Ngành nghề phổ biến */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Ngành nghề phổ biến</h2>
                {isLoadingFields ? (
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {popularFields.map((field) => (
                      <li key={field.id}>
                        <button
                          onClick={() => handleFieldSearch(field.id, field.name)}
                          className="text-sm text-gray-600 hover:text-primary transition-colors flex justify-between w-full text-left"
                        >
                          <span>{field.name}</span>
                          <span>({field.jobCount})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Gợi ý từ khóa */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Gợi ý từ khóa</h2>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(keyword)}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-purple-100 hover:text-primary transition-colors"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
