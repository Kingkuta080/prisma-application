import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApplicationPdfBuffer } from "@/lib/generate-application-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: {
      session: true,
      payments: { orderBy: { createdAt: "desc" } },
      user: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paid = application.payments?.some((p) => p.status === "COMPLETED");
  if (!paid && application.status !== "PAID" && application.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Payment required before downloading form" },
      { status: 403 }
    );
  }

  // Completed payment (for reference + date)
  const completedPayment =
    application.payments.find((p) => p.status === "COMPLETED") ??
    application.payments[0] ??
    null;

  const paymentStatusForReceipt =
    completedPayment?.status === "COMPLETED"
      ? "PAID"
      : completedPayment?.status === "FAILED"
        ? "FAILED"
        : completedPayment?.status
          ? String(completedPayment.status)
          : application.status === "PAID" || application.status === "COMPLETED"
            ? "PAID"
            : null;

  const amount = Number(application.session.amount);
  const paymentDate = completedPayment?.createdAt
    ? completedPayment.createdAt.toISOString().slice(0, 10)
    : null;
  const paymentReference = completedPayment?.reference ?? null;

  // Parent / guardian info from the user record
  const parentName = application.user.name ?? null;
  const parentEmail = application.user.email ?? null;
  const parentPhone = application.user.phone ?? null;

  try {
    const buffer = await generateApplicationPdfBuffer({
      wardName: application.wardName,
      wardDob: application.wardDob.toISOString().slice(0, 10),
      wardGender: application.wardGender,
      sessionYear: application.session.year,
      applicationId: application.id,
      class: application.class,
      amount,
      paymentDate,
      paymentStatus: paymentStatusForReceipt,
      paymentReference,
      parentName,
      parentEmail,
      parentPhone,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${id}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF generation failed", e);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
