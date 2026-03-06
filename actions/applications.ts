"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PreviousSchoolInput = { schoolName: string; date: string };

export async function createApplication(
  sessionId: string,
  data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    wardDob: string;
    wardGender: string;
    selectedClass: string;
    stateOfOrigin?: string;
    lga?: string;
    nationality?: string;
    religion?: string;
    medicalInfo?: string;
    photoUrl?: string;
    previousSchools?: PreviousSchoolInput[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const {
    firstName,
    lastName,
    middleName,
    wardDob,
    wardGender,
    selectedClass,
    stateOfOrigin,
    lga,
    nationality,
    religion,
    medicalInfo,
    photoUrl,
    previousSchools = [],
  } = data;

  const classTrimmed = selectedClass.trim();
  if (!classTrimmed) return { error: "Class is required" };
  if (!firstName?.trim() || !lastName?.trim()) return { error: "First name and last name are required" };

  const appSession = await prisma.applicationSession.findUnique({
    where: { id: sessionId },
  });
  if (!appSession) return { error: "Session not found" };

  const now = new Date();
  if (now < appSession.openAt || now > appSession.closeAt) {
    return { error: "Application session is not open for submissions" };
  }

  const wardName = [firstName.trim(), lastName.trim(), middleName?.trim()].filter(Boolean).join(" ");

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      sessionId,
      wardName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName?.trim() || null,
      wardDob: new Date(wardDob),
      wardGender: wardGender.trim(),
      class: classTrimmed,
      stateOfOrigin: stateOfOrigin?.trim() || null,
      lga: lga?.trim() || null,
      nationality: nationality?.trim() || null,
      religion: religion?.trim() || null,
      medicalInfo: medicalInfo?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
      status: "SUBMITTED",
    },
  });

  if (previousSchools.length > 0) {
    await prisma.previousSchool.createMany({
      data: previousSchools.map((ps) => ({
        applicationId: application.id,
        schoolName: ps.schoolName.trim(),
        date: ps.date.trim(),
      })),
    });
  }

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
