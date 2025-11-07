import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const Toast = ({ message, type, onRemove, duration = 5000 }) => {
  const [isLeaving, setIsLeaving] = React.useState(false);

  const startClose = React.useCallback(() => {
    setIsLeaving(true);
  }, []);

  React.useEffect(() => {
    if (!isLeaving) return;
    const timer = setTimeout(onRemove, 280);
    return () => clearTimeout(timer);
  }, [isLeaving, onRemove]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      startClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, startClose]);

  return (
    <div className={`ev-toast ev-toast-${type} ${isLeaving ? 'ev-toast-leave' : ''}`}>
      <span className="ev-toast-message">{message}</span>
      <button onClick={startClose} className="ev-toast-close-btn" aria-label="Đóng thông báo">&times;</button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {ReactDOM.createPortal(
        <div className="ev-toast-container">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};