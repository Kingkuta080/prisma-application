"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { initializePayment } from "@/actions/payment";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUBMITTED: "bg-amber-100 text-amber-800 border-amber-200",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const s = styles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s}`}
    >
      {status}
    </span>
  );
}

function AdmissionBadge({ status }: { status: string | null | undefined }) {
  if (status == null || status === "") return <span className="text-muted-foreground">—</span>;
  const styles: Record<string, string> = {
    OFFERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };
  const s = styles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s}`}
    >
      {status}
    </span>
  );
}

type App = {
  id: string;
  status: string;
  wardName: string;
  class: string;
  session: { year: number; amount: number };
  payments: { id: string; status: string }[];
  admission?: { id: string; status: string } | null;
};

export function ApplicationsTable({
  applications,
}: {
  applications: App[];
}) {
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  async function handlePay(applicationId: string) {
    setPayingId(applicationId);
    try {
      const result = await initializePayment(applicationId);
      if (result.ok) {
        window.open(result.authorizationUrl, "_blank", "noopener,noreferrer");
        return;
      }
      toast.error(result.error);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPayingId(null);
      router.refresh();
    }
  }

  if (applications.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        No applications yet. Start one to apply for a session.
      </p>
    );
  }

  function statusStyles(status: string) {
    if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (status === "PAID") return "bg-amber-100 text-amber-800";
    if (status === "SUBMITTED") return "bg-teal-100 text-teal-800";
    return "bg-muted text-muted-foreground";
  }

  return (
    <>
      {/* Desktop: table — Name, Class, Status, Admission, Actions */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admission</TableHead>
              <TableHead className="w-[180px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const hasPaid =
                app.status === "PAID" ||
                app.status === "COMPLETED" ||
                app.payments.some((p) => p.status === "COMPLETED");
              return (
                <TableRow key={app.id}>
                  <TableCell>{app.wardName}</TableCell>
                  <TableCell>{app.class}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell>
                    <AdmissionBadge status={app.admission?.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {app.status === "SUBMITTED" && !hasPaid && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePay(app.id)}
                          disabled={payingId === app.id}
                        >
                          {payingId === app.id ? "…" : "Make payment"}
                        </Button>
                      )}
                      {(app.status === "PAID" || app.status === "COMPLETED") && (
                        <Button size="sm" variant="link" asChild className="p-0 h-auto">
                          <a href={`/api/applications/${app.id}/form`} download>
                            Download receipt
                          </a>
                        </Button>
                      )}
                      {app.admission && (
                        <Button size="sm" variant="link" asChild className="p-0 h-auto">
                          <a href={`/api/applications/${app.id}/admission-letter`} download>
                            Download admission letter
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: multilevel cards — collapsed: name, status badge, admission badge; expanded: class, Make payment, receipts */}
      <div className="space-y-3 md:hidden">
        {applications.map((app) => {
          const hasPaid =
            app.status === "PAID" ||
            app.status === "COMPLETED" ||
            app.payments.some((p) => p.status === "COMPLETED");
          const isExpanded = expandedCardId === app.id;
          return (
            <div
              key={app.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                onClick={() =>
                  setExpandedCardId((id) => (id === app.id ? null : app.id))
                }
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {app.wardName}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <StatusBadge status={app.status} />
                    <AdmissionBadge status={app.admission?.status} />
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-border px-4 py-3 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Class: <span className="font-medium text-foreground">{app.class}</span>
                  </p>
                  {app.status === "SUBMITTED" && !hasPaid && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePay(app.id)}
                      disabled={payingId === app.id}
                    >
                      {payingId === app.id ? "…" : "Make payment"}
                    </Button>
                  )}
                  {(app.status === "PAID" || app.status === "COMPLETED") && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/api/applications/${app.id}/form`} download>
                        Download receipt
                      </a>
                    </Button>
                  )}
                  {app.admission && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/api/applications/${app.id}/admission-letter`} download>
                        Download admission letter
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
