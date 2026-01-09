export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};

export const formatSalary = (min?: number, max?: number): string => {
  if (!min && !max) {
    return 'Thỏa thuận';
  }

  if (min && max) {
    if (min === max) {
      return `${min.toLocaleString('vi-VN')} triệu`;
    }
    return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} triệu`;
  }

  if (min) {
    return `Từ ${min.toLocaleString('vi-VN')} triệu`;
  }

  if (max) {
    return `Lên đến ${max.toLocaleString('vi-VN')} triệu`;
  }

  return 'Thỏa thuận';
};

