"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

/* ── Status badge helpers ──────────────────────────────────────────────── */

type StatusConfig = {
  label: string;
  dot: string;
  badge: string;
};

const APP_STATUS: Record<string, StatusConfig> = {
  SUBMITTED: {
    label: "Not paid",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const ADMISSION_STATUS: Record<string, StatusConfig> = {
  OFFERED: {
    label: "Admitted",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

function StatusBadge({
  status,
  map,
}: {
  status: string;
  map: Record<string, StatusConfig>;
}) {
  const cfg = map[status] ?? {
    label: status,
    dot: "bg-muted-foreground/40",
    badge: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Types ──────────────────────────────────────────────────────────────── */

type App = {
  id: string;
  status: string;
  wardName: string;
  class: string;
  session: { year: number; amount: number };
  payments: { id: string; status: string }[];
  admission?: { id: string; status: string } | null;
};

/* ── Component ──────────────────────────────────────────────────────────── */

export function ApplicationsTable({
  applications,
}: {
  applications: App[];
}) {
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">
          No applications yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start an application to apply for the current enrollment session.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Class
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Session
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admission
              </TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow
                key={app.id}
                className="cursor-pointer transition-colors hover:bg-muted/30"
                onClick={() => router.push(`/applicant/${app.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {app.wardName
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="font-medium text-foreground">
                      {app.wardName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {app.class}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {app.session.year}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} map={APP_STATUS} />
                </TableCell>
                <TableCell>
                  {app.admission ? (
                    <StatusBadge
                      status={app.admission.status}
                      map={ADMISSION_STATUS}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {applications.map((app) => {
          const initials = app.wardName
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <Link
              key={app.id}
              href={`/applicant/${app.id}`}
              className="flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:bg-muted/30 active:bg-muted/50"
            >
              {/* Avatar + name */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {app.wardName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.class} · {app.session.year}
                  </p>
                </div>
              </div>

              {/* Status + chevron */}
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status={app.status} map={APP_STATUS} />
                {app.admission && (
                  <StatusBadge
                    status={app.admission.status}
                    map={ADMISSION_STATUS}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
