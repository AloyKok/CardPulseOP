"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = {
  id: number;
  message: string;
  visible: boolean;
};

type ToastContextValue = {
  showToast: (message: string) => void;
};

const TOAST_VISIBLE_MS = 2200;
const TOAST_FADE_MS = 260;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);

  const showToast = useCallback((message: string) => {
    const id = nextIdRef.current++;

    setToasts((current) => [...current, { id, message, visible: true }]);

    window.setTimeout(() => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)),
      );
    }, TOAST_VISIBLE_MS);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_VISIBLE_MS + TOAST_FADE_MS);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-[calc(env(safe-area-inset-top)+76px)] z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:top-24">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-[min(92vw,360px)] rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(10,10,11,0.96))] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ${
              toast.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
