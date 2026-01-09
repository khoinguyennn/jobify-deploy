import { Heart, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFollowCompanyCheck, useToggleFollowCompany } from '@/hooks/useFollowedCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/utils/toast';

interface FollowCompanyButtonProps {
  companyId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'icon' | 'button' | 'both';
}

export const FollowCompanyButton: React.FC<FollowCompanyButtonProps> = ({ 
  companyId, 
  className = '', 
  size = 'md',
  showLabel = false,
  variant = 'icon'
}) => {
  const router = useRouter();
  const { userType, isAuthenticated } = useAuth();
  const { data: followStatus } = useFollowCompanyCheck(isAuthenticated && userType === 'user' ? companyId : undefined);
  const { toggleFollowCompany, isLoading } = useToggleFollowCompany();
  
  const isFollowed = followStatus?.isFollowed || false;
  const isCompanyUser = userType === 'company';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };
  
  const buttonSizeClasses = {
    sm: 'text-sm px-3 py-1',
    md: 'text-sm px-4 py-2', 
    lg: 'text-base px-6 py-3'
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn click event bubbling
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      showToast.info('Vui lòng đăng nhập để theo dõi công ty!');
      router.push('/login');
      return;
    }
    
    // Kiểm tra role
    if (isCompanyUser) {
      showToast.warning('Chỉ người tìm việc mới có thể theo dõi công ty!');
      return;
    }
    
    if (!isLoading) {
      toggleFollowCompany(companyId, isFollowed);
    }
  };
  
  // Render dựa trên variant
  if (variant === 'button') {
    return (
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant={isFollowed ? 'outline' : 'default'}
        className={`${buttonSizeClasses[size]} ${
          isFollowed 
            ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' 
            : 'bg-primary hover:bg-primary/90'
        } ${className}`}
        aria-label={isFollowed ? 'Hủy theo dõi công ty' : 'Theo dõi công ty'}
      >
        {isFollowed ? (
          <>
            <UserCheck className={`${sizeClasses[size]} mr-2`} />
            Đang theo dõi
          </>
        ) : (
          <>
            <UserPlus className={`${sizeClasses[size]} mr-2`} />
            Theo dõi
          </>
        )}
      </Button>
    );
  }
  
  if (variant === 'both') {
    return (
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="outline"
        className={`${buttonSizeClasses[size]} flex items-center gap-2 ${className}`}
        aria-label={isFollowed ? 'Hủy theo dõi công ty' : 'Theo dõi công ty'}
      >
        <Heart 
          className={`${sizeClasses[size]} ${
            isFollowed 
              ? 'text-red-500 fill-red-500' 
              : 'text-muted-foreground'
          }`}
        />
        <span>{isFollowed ? 'Đang theo dõi' : 'Theo dõi'}</span>
      </Button>
    );
  }
  
  // Default variant = 'icon'
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 transition-colors ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      aria-label={isFollowed ? 'Hủy theo dõi công ty' : 'Theo dõi công ty'}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-colors ${
          isFollowed 
            ? 'text-red-500 fill-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-red-500'
        }`}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
        </span>
      )}
    </button>
  );
};
