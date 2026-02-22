import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

const GATEWAY_BASE = process.env.GATEWAY_PUBLIC_URL;

type PageProps = {
  searchParams: Promise<{ status?: string; reference?: string }>;
};

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.reference?.trim();
  const queryStatus = (params.status ?? "").toLowerCase();

  if (!reference) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12 text-center">
        <h1 className="text-xl font-semibold">Payment</h1>
        <p className="text-muted-foreground">
          No payment reference was provided. If you just completed a payment,
          please return to your dashboard.
        </p>
        <Button asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
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
      // Fall back to query param if validate fails (e.g. network)
    }
  }
  if (verifiedStatus === null) {
    verifiedStatus = queryStatus === "success" ? "success" : "failed";
  }

  const payment = await prisma.payment.findFirst({
    where: { reference },
    include: { application: true },
  });

  if (payment && payment.status === "PENDING") {
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
  const amountFormatted = amount
    ? `₦${amount.toLocaleString("en-NG")}`
    : "";

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <h1 className="text-xl font-semibold">
        {isSuccess ? "Payment successful" : "Payment failed"}
      </h1>
      <p className="text-muted-foreground">
        {isSuccess
          ? amountFormatted
            ? `Your payment of ${amountFormatted} was completed successfully.`
            : "Your payment was completed successfully."
          : "The payment could not be completed or was not successful. You can try again from your dashboard."}
      </p>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
