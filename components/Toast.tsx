"use client";

import { useToast } from "@/hooks/useToast";

const Toast = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed flex flex-col gap-2 items-center top-6 left-1/2 w-full -translate-x-1/2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-gray-800 text-white p-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
            toast.visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-50 -translate-y-4 scale-90"
          }`}
        >
          <div>{toast.message}</div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
