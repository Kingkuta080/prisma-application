"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initializePayment } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { DownloadReceiptButton } from "@/components/download-receipt-button";
import { toast } from "sonner";
import { useGlobalError } from "@/components/global-error-provider";
import { CreditCard, FileText, Loader2 } from "lucide-react";

export function ApplicantDetailActions({
  applicationId,
  hasPaid,
  hasAdmission,
}: {
  applicationId: string;
  hasPaid: boolean;
  hasAdmission: boolean;
}) {
  const router = useRouter();
  const globalError = useGlobalError();
  const [paying, setPaying] = useState(false);
  const [downloadingAdmission, setDownloadingAdmission] = useState(false);

  async function handlePay() {
    setPaying(true);
    try {
      const result = await initializePayment(applicationId);
      if ("ok" in result && result.ok && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }
      const msg = ("error" in result ? result.error : null) ?? "Could not start payment";
      globalError?.showError(msg, handlePay);
      toast.error(msg);
    } catch {
      globalError?.showError("Something went wrong. Please try again.", handlePay);
      toast.error("Something went wrong");
    } finally {
      setPaying(false);
      router.refresh();
    }
  }

  if (!hasPaid && !hasAdmission) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handlePay}
          disabled={paying}
          className="gap-2"
        >
          {paying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Redirecting to payment…
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              Make Payment
            </>
          )}
        </Button>
      </div>
    );
  }

  function handleDownloadAdmission() {
    if (downloadingAdmission) return;
    setDownloadingAdmission(true);
    try {
      window.open(`/api/applications/${applicationId}/admission-letter`, "_blank");
    } finally {
      setTimeout(() => setDownloadingAdmission(false), 4000);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!hasPaid && (
        <Button onClick={handlePay} disabled={paying} className="gap-2">
          {paying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              Make Payment
            </>
          )}
        </Button>
      )}
      {hasPaid && (
        <DownloadReceiptButton
          applicationId={applicationId}
          variant="outline"
          className="gap-2"
        />
      )}
      {hasAdmission && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleDownloadAdmission}
          disabled={downloadingAdmission}
        >
          {downloadingAdmission ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <FileText className="size-4" />
              Download Admission Letter
            </>
          )}
        </Button>
      )}
    </div>
  );
}
