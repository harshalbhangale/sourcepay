import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: colors[type],
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
        fontWeight: '500',
        fontSize: '14px',
      }}
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastProps['type'] } | null>(null);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}


