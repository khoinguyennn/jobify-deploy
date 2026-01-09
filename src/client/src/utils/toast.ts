import { toast } from 'react-toastify';

// Utility functions để sử dụng toast dễ dàng trong toàn bộ ứng dụng
export const showToast = {
  // Thông báo thành công
  success: (message: string) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Thông báo lỗi
  error: (message: string) => {
    toast.error(message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Thông báo cảnh báo
  warning: (message: string) => {
    toast.warning(message, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Thông báo thông tin
  info: (message: string) => {
    toast.info(message, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Thông báo tùy chỉnh
  custom: (message: string, options?: any) => {
    toast(message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  // Thông báo promise (loading -> success/error)
  promise: async <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    });
  },
};

// Export các function riêng lẻ để dễ sử dụng
export const { success, error, warning, info, custom, promise } = showToast;
