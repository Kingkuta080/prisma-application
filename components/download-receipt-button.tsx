"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

type DownloadReceiptButtonProps = {
  applicationId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  className?: string;
  children?: React.ReactNode;
};

export function DownloadReceiptButton({
  applicationId,
  size = "default",
  variant = "outline",
  className,
  children,
}: DownloadReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    const url = `/api/applications/${applicationId}/form`;
    window.open(url, "_blank");
    setTimeout(() => setLoading(false), 3000);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className ?? "gap-2"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className={size === "sm" ? "size-3.5 shrink-0 animate-spin" : "size-4 shrink-0 animate-spin"} />
          Preparing…
        </>
      ) : (
        <>
          <FileDown className={size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"} />
          {children ?? "Download Receipt"}
        </>
      )}
    </Button>
  );
}
