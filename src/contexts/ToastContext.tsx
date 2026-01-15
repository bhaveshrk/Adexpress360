import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast } from '../types';

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type']) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => hideToast(id), 4000);
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => hideToast(toast.id)}
                        className={`
              cursor-pointer transition-opacity hover:opacity-90
              ${toast.type === 'success' ? 'toast-success' : ''}
              ${toast.type === 'error' ? 'toast-error' : ''}
              ${toast.type === 'info' ? 'toast-info' : ''}
            `}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
