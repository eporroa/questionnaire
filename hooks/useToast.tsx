"use client";

import { Toast, ToastContext } from "@/context/ToastContext";
import { useContext } from "react";

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
