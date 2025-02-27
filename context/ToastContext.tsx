"use client";

import type { FC, ReactNode } from "react";
import { createContext, useCallback, useState } from "react";

const TOAST_REMOVE_DELAY = 3000;
const TOAST_ANIMATION_DELAY = 300;

export interface Toast {
  id: string;
  message: string;
  visible: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now() + Math.random().toString(36);
    const newToast: Toast = { id, message, visible: false };

    setToasts((prev) => [newToast, ...prev]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, visible: true } : toast
        )
      );
    }, 1);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, visible: false } : toast
        )
      );

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, TOAST_ANIMATION_DELAY);
    }, TOAST_REMOVE_DELAY);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_ANIMATION_DELAY);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};
