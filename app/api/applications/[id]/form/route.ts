import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApplicationPdfBuffer } from "@/lib/generate-application-pdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await prisma.application.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      session: true,
      payments: { orderBy: { createdAt: "desc" } },
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

  const latestPayment = application.payments[0] ?? null;
  const paymentStatusForReceipt =
    latestPayment?.status === "COMPLETED"
      ? "PAID"
      : latestPayment?.status === "FAILED"
        ? "FAILED"
        : latestPayment?.status
          ? String(latestPayment.status)
          : application.status === "PAID" || application.status === "COMPLETED"
            ? "PAID"
            : null;
  const amount = Number(application.session.amount);
  const paymentDate = latestPayment?.createdAt
    ? latestPayment.createdAt.toISOString().slice(0, 10)
    : null;

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
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="application-${id}.pdf"`,
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
