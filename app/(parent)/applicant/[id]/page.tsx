import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ApplicantDetailActions } from "./applicant-detail-actions";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Stethoscope,
  School,
  Hash,
  CheckCircle2,
  Clock,
  XCircle,
  FileDown,
} from "lucide-react";

/* ── Status helpers ──────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; cls: string }> = {
    SUBMITTED: {
      label: "Not paid",
      dot: "bg-amber-500",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    PAID: {
      label: "Paid",
      dot: "bg-emerald-500",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    COMPLETED: {
      label: "Completed",
      dot: "bg-blue-500",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    dot: "bg-muted-foreground/40",
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AdmissionBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-sm text-muted-foreground">—</span>;
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    OFFERED: {
      label: "Admitted",
      icon: <CheckCircle2 className="size-3.5 text-emerald-600" />,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PENDING: {
      label: "Pending Decision",
      icon: <Clock className="size-3.5 text-amber-600" />,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    REJECTED: {
      label: "Not Admitted",
      icon: <XCircle className="size-3.5 text-red-600" />,
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const cfg = map[status] ?? {
    label: status,
    icon: null,
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

/* ── Info row helper ─────────────────────────────────────────────────────── */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 wrap-break-word text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: {
      session: true,
      payments: { orderBy: { createdAt: "desc" } },
      admission: true,
    },
  });

  if (!application) notFound();

  let previousSchools: { id: string; schoolName: string; date: string }[] = [];
  try {
    previousSchools = await prisma.previousSchool.findMany({
      where: { applicationId: application.id },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    previousSchools = [];
  }

  const hasPaid =
    application.status === "PAID" ||
    application.status === "COMPLETED" ||
    application.payments.some((p) => p.status === "COMPLETED");

  const wardName = application.wardName;
  const dob = application.wardDob.toISOString().slice(0, 10);
  const initials = wardName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Breadcrumb / back ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">
            Application Details
          </h1>
        </div>
      </div>

      {/* ── Profile header card (minimal: soft tint, no solid gradient) ─────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="relative h-16 sm:h-20 bg-primary/[0.08]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          {/* Photo + badges row */}
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-2 sm:-mt-10">
            {application.photoUrl ? (
              <img
                src={application.photoUrl}
                alt={wardName}
                className="h-[72px] w-[72px] rounded-xl border-4 border-white bg-white object-cover shadow-md sm:h-20 sm:w-20"
              />
            ) : (
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border-4 border-white bg-primary/10 text-xl font-bold text-primary shadow-md sm:h-20 sm:w-20">
                {initials}
              </span>
            )}
            {/* Status badges — wrap on mobile */}
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={application.status} />
              {application.admission && (
                <AdmissionBadge status={application.admission.status} />
              )}
            </div>
          </div>
          {/* Name + meta + download */}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
                {wardName}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {(application as unknown as { class: string }).class} ·{" "}
                {application.session.year} Session
              </p>
            </div>
            {hasPaid && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
              >
                <a href={`/api/applications/${application.id}/form`} download>
                  <FileDown className="size-3.5" />
                  Download Receipt
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Details grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Personal info */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="size-4 text-muted-foreground" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <InfoRow label="Full Name" value={wardName} icon={User} />
            <InfoRow label="Date of Birth" value={dob} icon={Calendar} />
            <InfoRow
              label="Gender"
              value={application.wardGender}
              icon={User}
            />
            <InfoRow
              label="Class"
              value={(application as unknown as { class: string }).class}
              icon={Hash}
            />
          </div>
        </div>

        {/* Origin & background */}
        {(application.stateOfOrigin ||
          application.lga ||
          application.nationality ||
          application.religion) && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-muted-foreground" />
              Origin & Background
            </h3>
            <div className="space-y-4">
              {application.stateOfOrigin && (
                <InfoRow
                  label="State of Origin"
                  value={application.stateOfOrigin}
                  icon={MapPin}
                />
              )}
              {application.lga && (
                <InfoRow label="LGA" value={application.lga} icon={MapPin} />
              )}
              {application.nationality && (
                <InfoRow
                  label="Nationality"
                  value={application.nationality}
                />
              )}
              {application.religion && (
                <InfoRow label="Religion" value={application.religion} />
              )}
            </div>
          </div>
        )}

        {/* Medical */}
        {application.medicalInfo && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Stethoscope className="size-4 text-muted-foreground" />
              Medical Information
            </h3>
            <p className="text-sm leading-relaxed text-foreground">
              {application.medicalInfo}
            </p>
          </div>
        )}

        {/* Previous schools */}
        {previousSchools.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <School className="size-4 text-muted-foreground" />
              Previous Schools
            </h3>
            <div className="space-y-3">
              {previousSchools.map((ps, i) => (
                <div
                  key={ps.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {ps.schoolName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ps.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Actions
        </h3>
        <ApplicantDetailActions
          applicationId={application.id}
          hasPaid={hasPaid}
          hasAdmission={!!application.admission}
        />
      </div>
    </div>
  );
}
