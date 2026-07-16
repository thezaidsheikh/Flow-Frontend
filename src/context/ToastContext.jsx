import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    container: 'bg-white border-success-200',
    iconWrap: 'bg-success-100 text-success-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-white border-red-200',
    iconWrap: 'bg-red-100 text-red-600',
    Icon: AlertCircle,
  },
  info: {
    container: 'bg-white border-primary-200',
    iconWrap: 'bg-primary-100 text-primary-600',
    Icon: Info,
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error', 6000),
    info: (msg) => showToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(({ id, message, type }) => {
          const style = toastStyles[type] || toastStyles.info;
          const { Icon } = style;
          return (
            <div
              key={id}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lifted animate-slide-in-right ${style.container}`}
              role="status"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconWrap}`}
              >
                <Icon size={18} />
              </div>
              <p className="text-sm text-gray-700 flex-1 pt-1 break-words">
                {message}
              </p>
              <button
                onClick={() => removeToast(id)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
