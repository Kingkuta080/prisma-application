import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DownloadReceiptButton } from "@/components/download-receipt-button";

const GATEWAY_BASE = process.env.GATEWAY_PUBLIC_URL;

type PageProps = {
  searchParams: Promise<{ status?: string; reference?: string; trxref?: string }>;
};

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = (params.reference ?? params.trxref ?? "").trim();
  const queryStatus = (params.status ?? "").toLowerCase();

  if (!reference) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <h1 className="font-heading text-xl font-semibold">No Reference</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No payment reference was provided. If you just completed a payment,
            please return to your dashboard.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  let verifiedStatus: "success" | "failed" | null = null;
  if (GATEWAY_BASE) {
    try {
      const validateUrl = `${GATEWAY_BASE.replace(/\/$/, "")}/api/v1/paystack/validate`;
      const res = await fetch(validateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.data?.status === "success") {
        verifiedStatus = "success";
      } else if (data?.ok && data?.data) {
        verifiedStatus = "failed";
      }
    } catch {
      // Gateway unreachable — fall back to redirect query params
    }
  }

  if (verifiedStatus === null) {
    const successValues = ["success", "completed", "paid"];
    const failValues = ["failed", "error", "cancel", "cancelled"];
    if (successValues.includes(queryStatus)) verifiedStatus = "success";
    else if (failValues.includes(queryStatus)) verifiedStatus = "failed";
  }

  const payment = await prisma.payment.findFirst({
    where: { reference },
    include: { application: true },
  });

  if (verifiedStatus === null && payment && payment.status === "PENDING") {
    verifiedStatus = "success";
  }

  if (payment && payment.status === "PENDING" && verifiedStatus !== null) {
    const newPaymentStatus = verifiedStatus === "success" ? "COMPLETED" : "FAILED";
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: newPaymentStatus, verifiedBy: "SYSTEM" },
      }),
      ...(verifiedStatus === "success"
        ? [
            prisma.application.update({
              where: { id: payment.applicationId },
              data: { status: "PAID" as const },
            }),
          ]
        : []),
    ]);
  }

  const isSuccess = verifiedStatus === "success";
  const amount = payment ? Number(payment.amount) : 0;
  const amountFormatted = amount ? `₦${amount.toLocaleString("en-NG")}` : "";

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* Status banner — minimal: soft tint, dark text */}
        <div
          className={`relative px-6 py-8 text-center ${
            isSuccess
              ? "bg-emerald-500/[0.08]"
              : "bg-red-500/[0.08]"
          }`}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          {isSuccess ? (
            <CheckCircle2 className="relative mx-auto size-14 text-emerald-600" />
          ) : (
            <XCircle className="relative mx-auto size-14 text-red-600" />
          )}
          <h1 className="relative mt-4 font-heading text-2xl font-semibold text-foreground">
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h1>
          {isSuccess && amountFormatted && (
            <p className="relative mt-2 text-3xl font-bold text-foreground tabular-nums">
              {amountFormatted}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            {isSuccess
              ? amountFormatted
                ? `Your payment of ${amountFormatted} has been received and confirmed. You can now download your application receipt.`
                : "Your payment was completed successfully."
              : "The payment could not be completed or was not successful. You can try again from your dashboard."}
          </p>

          {reference && (
            <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Reference
              </p>
              <p className="mt-0.5 font-mono text-sm text-foreground">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isSuccess && payment?.applicationId && (
              <DownloadReceiptButton
                applicationId={payment.applicationId}
                className="gap-2"
              />
            )}
            <Button
              asChild
              variant={isSuccess && payment?.applicationId ? "outline" : "default"}
              className="gap-2"
            >
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
