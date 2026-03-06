"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { GlobalErrorModal } from "./global-error-modal";

type GlobalErrorContextValue = {
  showError: (message: string, onRetry?: () => void) => void;
};

const GlobalErrorContext = createContext<GlobalErrorContextValue | null>(null);

export function useGlobalError() {
  const ctx = useContext(GlobalErrorContext);
  return ctx;
}

export function GlobalErrorProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onRetry, setOnRetry] = useState<(() => void) | undefined>(undefined);

  const showError = useCallback((msg: string, retry?: () => void) => {
    setMessage(msg);
    setOnRetry(() => retry);
    setOpen(true);
  }, []);

  const handleRetry = useCallback(() => {
    setOpen(false);
    onRetry?.();
  }, [onRetry]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    setOnRetry(undefined);
  }, []);

  return (
    <GlobalErrorContext.Provider value={{ showError }}>
      {children}
      <GlobalErrorModal
        open={open}
        message={message}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </GlobalErrorContext.Provider>
  );
}
