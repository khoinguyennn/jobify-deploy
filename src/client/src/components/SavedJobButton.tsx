import { Heart } from 'lucide-react';
import { useSavedJobCheck, useToggleSaveJob } from '@/hooks/useSavedJobs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/utils/toast';

interface SavedJobButtonProps {
  jobId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SavedJobButton: React.FC<SavedJobButtonProps> = ({ 
  jobId, 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const router = useRouter();
  const { userType, isAuthenticated } = useAuth();
  const { data: savedStatus } = useSavedJobCheck(isAuthenticated && userType === 'user' ? jobId : undefined);
  const { toggleSaveJob, isLoading } = useToggleSaveJob();
  
  const isSaved = savedStatus?.isSaved || false;
  const isCompanyUser = userType === 'company';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn click event bubbling
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      showToast.info('Vui lòng đăng nhập để lưu công việc!');
      router.push('/login');
      return;
    }
    
    // Kiểm tra role
    if (isCompanyUser) {
      showToast.warning('Chỉ người tìm việc mới có thể lưu công việc!');
      return;
    }
    
    if (!isLoading) {
      toggleSaveJob(jobId, isSaved);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 transition-colors ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      aria-label={isSaved ? 'Hủy lưu công việc' : 'Lưu công việc'}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-colors ${
          isSaved 
            ? 'text-red-500 fill-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-red-500'
        }`}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {isSaved ? 'Đã lưu' : 'Lưu'}
        </span>
      )}
    </button>
  );
};

export default SavedJobButton;
export { SavedJobButton };
