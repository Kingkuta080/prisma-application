import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Payment webhook: accepts (1) legacy payload by paymentId/applicationId + status,
 * or (2) gateway/Paystack event shape with event + data.reference + data.status.
 * Updates Payment by reference/id; idempotent (only from PENDING to COMPLETED/FAILED).
 */
export async function POST(request: Request) {
  const secret = process.env.WEBHOOK_PAYMENT_SECRET;
  const signature =
    request.headers.get("X-Webhook-Signature") ??
    request.headers.get("x-signature");

  if (secret && signature !== secret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: {
    applicationId?: string;
    paymentId?: string;
    id?: string;
    status?: string;
    event?: string;
    data?: { reference?: string; status?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Gateway/Paystack event shape (from RabbitMQ or direct webhook)
  const ref = body.data?.reference?.trim();
  const dataStatus = (body.data?.status ?? "").toLowerCase();
  if (ref) {
    const payment = await prisma.payment.findFirst({
      where: { reference: ref },
      include: { application: true },
    });
    if (payment && payment.status === "PENDING") {
      const newStatus = dataStatus === "success" ? "COMPLETED" : "FAILED";
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus, verifiedBy: "SYSTEM" },
        }),
        ...(newStatus === "COMPLETED"
          ? [
              prisma.application.update({
                where: { id: payment.applicationId },
                data: { status: "PAID" as const },
              }),
            ]
          : []),
      ]);
    }
    return NextResponse.json({ received: true });
  }

  // Legacy: paymentId or applicationId + status
  const paymentId = body.paymentId ?? body.id;
  const applicationId = body.applicationId;
  const status = body.status ?? "COMPLETED";

  if (!paymentId && !applicationId) {
    return NextResponse.json(
      { error: "Missing paymentId, applicationId, or data.reference" },
      { status: 400 }
    );
  }

  if (paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { application: true },
    });
    if (payment && payment.status === "PENDING" && status === "COMPLETED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: "COMPLETED", verifiedBy: "SYSTEM" },
        }),
        prisma.application.update({
          where: { id: payment.applicationId },
          data: { status: "PAID" },
        }),
      ]);
    }
  } else if (applicationId) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { payments: true },
    });
    const firstPayment = application?.payments[0];
    if (
      firstPayment &&
      firstPayment.status === "PENDING" &&
      status === "COMPLETED"
    ) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: firstPayment.id },
          data: { status: "COMPLETED", verifiedBy: "SYSTEM" },
        }),
        prisma.application.update({
          where: { id: applicationId },
          data: { status: "PAID" },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
