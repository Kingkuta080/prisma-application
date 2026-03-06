import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/school-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GATEWAY_BASE = process.env.GATEWAY_PUBLIC_URL;
const QUEUE_NAME = process.env.PAYMENT_QUEUE_NAME ?? "prisma_app_payments";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const origin = new URL(req.url).origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { id } = await params;

  const previewUrl = new URL(`/applicant/${id}/preview`, origin);

  // Validation
  if (!GATEWAY_BASE?.trim()) {
    previewUrl.searchParams.set("error", "Payment gateway is not configured");
    return NextResponse.redirect(previewUrl);
  }

  const email = session.user.email;
  if (!email?.trim()) {
    previewUrl.searchParams.set("error", "Email is required for payment");
    return NextResponse.redirect(previewUrl);
  }

  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: { session: true },
  });

  if (!application) {
    return NextResponse.redirect(new URL("/", origin));
  }

  const amountNaira = Number(application.session.amount);
  const appUrl = getAppBaseUrl() || origin;
  const redirectUrl = `${appUrl}/payment/result`;

  const initUrl = `${GATEWAY_BASE.replace(/\/$/, "")}/api/v1/paystack/initialize`;
  const body = {
    email: email.trim(),
    amount: amountNaira,
    redirectUrl,
    queueName: QUEUE_NAME,
    metadata: {
      queue: QUEUE_NAME,
      applicationId: id,
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
    const msg = err instanceof Error ? err.message : "Network error";
    previewUrl.searchParams.set("error", `Payment service error: ${msg}`);
    return NextResponse.redirect(previewUrl);
  }

  let data: {
    ok?: boolean;
    message?: string;
    data?: { authorizationUrl?: string; reference?: string };
  };
  try {
    data = await res.json();
  } catch {
    previewUrl.searchParams.set("error", "Invalid response from payment service");
    return NextResponse.redirect(previewUrl);
  }

  if (!res.ok || !data.ok || !data.data?.authorizationUrl) {
    const msg =
      data.message ??
      (res.status === 500 ? "Payment service error" : "Failed to initialize payment");
    previewUrl.searchParams.set("error", msg);
    return NextResponse.redirect(previewUrl);
  }

  const reference = data.data.reference?.trim();
  if (!reference) {
    previewUrl.searchParams.set("error", "Payment service did not return a reference");
    return NextResponse.redirect(previewUrl);
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

  // Redirect to external payment gateway
  return NextResponse.redirect(data.data.authorizationUrl);
}
