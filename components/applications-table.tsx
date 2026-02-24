"use client";

import { useRouter } from "next/navigation";
import { FileDown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { simulatePayment } from "@/actions/applications";

type App = {
  id: string;
  status: string;
  wardName: string;
  class: string;
  session: { year: number; amount: number };
  payments: { id: string; status: string }[];
  admission?: { id: string; status: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED:
    "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  PAID: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  PENDING:
    "bg-muted text-muted-foreground border border-border",
  OFFERED:
    "bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900",
  ACCEPTED:
    "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  DECLINED:
    "bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES.PENDING
      }`}
    >
      {status}
    </span>
  );
}

export function ApplicationsTable({
  applications,
}: {
  applications: App[];
}) {
  const router = useRouter();

  async function handlePay(applicationId: string) {
    await simulatePayment(applicationId);
    router.refresh();
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <FileDown className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No applications yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start an application for an open enrollment session to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile cards ─────────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {applications.map((app) => {
          const payment = app.payments[0];
          return (
            <div
              key={app.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {app.wardName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.class} &middot; {app.session.year}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Payment</span>
                  <StatusBadge
                    status={
                      payment?.status === "COMPLETED" ? "COMPLETED" : "PENDING"
                    }
                  />
                </div>
                {app.admission && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Admission</span>
                    <StatusBadge status={app.admission.status} />
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {app.status === "SUBMITTED" &&
                  payment?.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePay(app.id)}
                      className="gap-1.5"
                    >
                      <CreditCard className="size-3.5" />
                      Pay now
                    </Button>
                  )}
                {(app.status === "PAID" || app.status === "COMPLETED") && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a href={`/api/applications/${app.id}/form`} download>
                      <FileDown className="size-3.5" />
                      Download receipt
                    </a>
                  </Button>
                )}
                {app.admission && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a
                      href={`/api/applications/${app.id}/admission-letter`}
                      download
                    >
                      <FileDown className="size-3.5" />
                      Admission letter
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table ────────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {[
                "Child name",
                "Class",
                "Year",
                "Status",
                "Payment",
                "Admission",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => {
              const payment = app.payments[0];
              return (
                <tr key={app.id} className="group">
                  <td className="py-3.5 pr-4 font-medium text-foreground">
                    {app.wardName}
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground">
                    {app.class}
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground">
                    {app.session.year}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge
                      status={
                        payment?.status === "COMPLETED"
                          ? "COMPLETED"
                          : "PENDING"
                      }
                    />
                  </td>
                  <td className="py-3.5 pr-4">
                    {app.admission ? (
                      <StatusBadge status={app.admission.status} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      {app.status === "SUBMITTED" &&
                        payment?.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePay(app.id)}
                            className="gap-1.5 text-xs"
                          >
                            <CreditCard className="size-3" />
                            Pay
                          </Button>
                        )}
                      {(app.status === "PAID" ||
                        app.status === "COMPLETED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-1.5 text-xs"
                        >
                          <a
                            href={`/api/applications/${app.id}/form`}
                            download
                          >
                            <FileDown className="size-3" />
                            Download receipt
                          </a>
                        </Button>
                      )}
                      {app.admission && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="gap-1.5 text-xs"
                        >
                          <a
                            href={`/api/applications/${app.id}/admission-letter`}
                            download
                          >
                            <FileDown className="size-3" />
                            Letter
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
