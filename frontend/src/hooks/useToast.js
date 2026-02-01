import { toast } from 'react-toastify';

const useToast = () => {
  const baseOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    toastStyle: {
      color: '#ffffff'
    }
  };

  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      ...baseOptions,
      ...options,
      toastStyle: {
        ...baseOptions.toastStyle,
        ...(options.toastStyle || {})
      }
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      ...baseOptions,
      ...options,
      toastStyle: {
        ...baseOptions.toastStyle,
        ...(options.toastStyle || {})
      }
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      ...baseOptions,
      ...options,
      toastStyle: {
        ...baseOptions.toastStyle,
        ...(options.toastStyle || {})
      }
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      ...baseOptions,
      ...options,
      toastStyle: {
        ...baseOptions.toastStyle,
        ...(options.toastStyle || {})
      }
    });
  };

  const showLoading = (message = "Loading...", options = {}) => {
    return toast.loading(message, {
      position: "top-right",
      ...options
    });
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
    dismissAll
  };
};

export default useToast;
