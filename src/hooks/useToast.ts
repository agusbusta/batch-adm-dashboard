import { useState } from 'react';
import type { ToastMessage, ToastVariant } from '../components/Toast';

let toastIdCounter = 0;
const generateToastId = () => `toast-${Date.now()}-${toastIdCounter++}`;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, variant: ToastVariant = 'info', options?: Partial<ToastMessage>) => {
    const toast: ToastMessage = {
      id: generateToastId(),
      variant,
      message,
      ...options,
    };
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'success', options),
    error: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'error', options),
    warning: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'warning', options),
    info: (message: string, options?: Partial<ToastMessage>) => showToast(message, 'info', options),
  };
};

