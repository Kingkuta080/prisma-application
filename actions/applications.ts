"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createApplication(
  sessionId: string,
  wardName: string,
  wardDob: string,
  wardGender: string,
  selectedClass: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const classTrimmed = selectedClass.trim();
  if (!classTrimmed) return { error: "Class is required" };

  const appSession = await prisma.applicationSession.findUnique({
    where: { id: sessionId },
  });
  if (!appSession) return { error: "Session not found" };

  const now = new Date();
  if (now < appSession.openAt || now > appSession.closeAt) {
    return { error: "Application session is not open for submissions" };
  }

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      sessionId,
      wardName: wardName.trim(),
      wardDob: new Date(wardDob),
      wardGender: wardGender.trim(),
      class: classTrimmed,
      status: "SUBMITTED",
    } as Parameters<typeof prisma.application.create>[0]["data"],
  });

  await prisma.payment.create({
    data: {
      applicationId: application.id,
      amount: appSession.amount,
      status: "PENDING",
      currency: "NGN",
      reference: `PAY-${application.id.slice(0, 8)}`,
    },
  });

  revalidatePath("/");
  return { ok: true, applicationId: application.id };
}

export async function simulatePayment(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: session.user.id,
    },
    include: { payments: true },
  });
  if (!application) return { error: "Application not found" };

  const payment = application.payments[0];
  if (!payment || payment.status === "COMPLETED") {
    return { error: "No pending payment" };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", verifiedBy: "SYSTEM" },
    }),
    prisma.application.update({
      where: { id: applicationId },
      data: { status: "PAID" },
    }),
  ]);

  revalidatePath("/");
  return { ok: true };
}
