"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const GATEWAY_BASE = process.env.GATEWAY_PUBLIC_URL;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const QUEUE_NAME = process.env.PAYMENT_QUEUE_NAME ?? "prisma_app_payments";

type InitializeResult =
  | { ok: true; authorizationUrl: string }
  | { error: string };

/**
 * Initialize a Paystack payment via the external gateway.
 * Calls the gateway first; on success creates a PENDING payment with the returned reference, then returns URL to redirect user.
 */
export async function initializePayment(
  applicationId: string
): Promise<InitializeResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const email = session.user.email;
  if (!email?.trim()) return { error: "Email is required for payment" };

  if (!GATEWAY_BASE?.trim()) {
    return { error: "Payment gateway is not configured" };
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: session.user.id },
    include: { session: true },
  });
  if (!application) return { error: "Application not found" };

  const amountNaira = Number(application.session.amount);
  const redirectUrl = `${APP_URL.replace(/\/$/, "")}/payment/result`;

  const initUrl = `${GATEWAY_BASE.replace(/\/$/, "")}/api/v1/paystack/initialize`;
  const body = {
    email: email.trim(),
    amount: amountNaira,
    redirectUrl,
    queueName: QUEUE_NAME,
    metadata: {
      queue: QUEUE_NAME,
      applicationId,
      userId: session.user.id,
    },
  };

  let res: Response;
  try {
    res = await fetch(initUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Payment service error:", err);
    const message = err instanceof Error ? err.message : "Network error";
    return { error: `Payment service error: ${message}` };
  }

  let data: {
    ok?: boolean;
    message?: string;
    data?: { authorizationUrl?: string; reference?: string };
  };
  try {
    data = await res.json();
  } catch {
    return { error: "Invalid response from payment service" };
  }

  if (!res.ok || !data.ok || !data.data?.authorizationUrl) {
    const msg =
      data.message ?? (res.status === 500 ? "Payment service error" : "Failed to initialize payment");
    return { error: msg };
  }

  const reference = data.data.reference?.trim();
  if (!reference) {
    return { error: "Payment service did not return a reference" };
  }

  await prisma.payment.create({
    data: {
      applicationId: application.id,
      amount: application.session.amount,
      status: "PENDING",
      currency: "NGN",
      reference,
    },
  });

  revalidatePath("/");
  return {
    ok: true,
    authorizationUrl: data.data.authorizationUrl,
  };
}
