import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    if (options.variant === 'destructive') {
      return sonnerToast.error(options.title, {
        description: options.description,
        duration: options.duration,
      });
    }
    return sonnerToast.success(options.title, {
      description: options.description,
      duration: options.duration,
    });
  };

  toast.success = sonnerToast.success;
  toast.error = sonnerToast.error;
  toast.loading = sonnerToast.loading;
  toast.promise = sonnerToast.promise;
  toast.dismiss = sonnerToast.dismiss;
  toast.custom = sonnerToast.custom;
  toast.info = sonnerToast.info;
  toast.warning = sonnerToast.warning;
  toast.message = sonnerToast.message;

  return { toast };
}
