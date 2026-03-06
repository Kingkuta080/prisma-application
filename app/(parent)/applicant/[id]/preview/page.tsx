import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  User,
  MapPin,
  Stethoscope,
  School,
  AlertCircle,
  ImagePlus,
} from "lucide-react";
import { PayNowButton } from "./pay-now-button";

export const dynamic = "force-dynamic";

export default async function ApplicationPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { error } = await searchParams;

  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: {
      session: true,
      previousSchools: { orderBy: { createdAt: "asc" } },
      payments: true,
    },
  });

  if (!application) notFound();

  // Already paid — go to detail page
  const hasPaid =
    application.payments.some((p) => p.status === "COMPLETED") ||
    application.status === "PAID" ||
    application.status === "COMPLETED";
  if (hasPaid) redirect(`/applicant/${id}`);

  const amount = Number(application.session.amount);
  const wardName = application.wardName;
  const dob = application.wardDob.toISOString().slice(0, 10);
  const initials = wardName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">
          Review Application
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your details below, then complete payment to submit.
        </p>
      </div>

      {/* ── Payment error (from failed /api/pay redirect) ─────────────────── */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {decodeURIComponent(error)}
        </div>
      )}

      {/* ── Fee card ─────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl shadow-md"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 70%, var(--brand-accent)) 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-white/75">
              {application.session.year} Enrollment · Application Fee
            </p>
            <p className="mt-0.5 font-heading text-3xl font-bold tabular-nums text-white">
              ₦{amount.toLocaleString("en-NG")}
            </p>
            <p className="mt-1 text-xs text-white/60">
              Required to confirm your application
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <CreditCard className="size-6 text-white" />
          </span>
        </div>
      </div>

      {/* ── Application data card ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        {/* Applicant header */}
        <div className="flex items-center gap-4 border-b border-border px-5 py-4 sm:px-6">
          {application.photoUrl ? (
            <img
              src={application.photoUrl}
              alt={wardName}
              className="h-14 w-14 rounded-xl border border-border object-cover shadow-sm"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {initials}
            </span>
          )}
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {wardName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {(application as unknown as { class: string }).class} ·{" "}
              {application.session.year} Session
            </p>
          </div>
        </div>

        {/* ── Personal information ───────────────────────────────────────── */}
        <PreviewSection title="Personal Information" icon={User}>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoPair label="Date of Birth" value={dob} />
            <InfoPair label="Gender" value={application.wardGender} />
          </div>
        </PreviewSection>

        {/* ── Origin & background ───────────────────────────────────────── */}
        {(application.stateOfOrigin ||
          application.lga ||
          application.nationality ||
          application.religion) && (
          <PreviewSection title="Origin & Background" icon={MapPin} border>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {application.stateOfOrigin && (
                <InfoPair
                  label="State of Origin"
                  value={application.stateOfOrigin}
                />
              )}
              {application.lga && (
                <InfoPair label="Local Government Area" value={application.lga} />
              )}
              {application.nationality && (
                <InfoPair label="Nationality" value={application.nationality} />
              )}
              {application.religion && (
                <InfoPair label="Religion" value={application.religion} />
              )}
            </div>
          </PreviewSection>
        )}

        {/* ── Medical ───────────────────────────────────────────────────── */}
        {application.medicalInfo && (
          <PreviewSection title="Medical Information" icon={Stethoscope} border>
            <InfoPair
              label="Known Conditions / Allergies"
              value={application.medicalInfo}
            />
          </PreviewSection>
        )}

        {/* ── Previous schools ──────────────────────────────────────────── */}
        {application.previousSchools.length > 0 && (
          <PreviewSection title="Previous Schools" icon={School} border>
            <div className="space-y-2">
              {application.previousSchools.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.schoolName}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* ── No photo notice ───────────────────────────────────────────── */}
        {!application.photoUrl && (
          <div className="border-t border-border px-5 py-3 sm:px-6">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImagePlus className="size-3.5 shrink-0" />
              No photo uploaded. You can add one from the applicant detail page
              later.
            </p>
          </div>
        )}
      </div>

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/">
            <Clock className="size-4" />
            Pay Later
          </Link>
        </Button>

        <PayNowButton applicationId={id} amount={amount} />
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function PreviewSection({
  title,
  icon: Icon,
  children,
  border,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`px-5 py-4 sm:px-6 sm:py-5 ${border ? "border-t border-border" : ""}`}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 wrap-break-word text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}
