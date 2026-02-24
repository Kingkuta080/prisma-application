import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeaderLogo } from "@/components/dashboard-header-logo";
import { signOutAction } from "@/actions/auth";

type DashboardPageHeaderProps = {
  user: { name?: string | null; email?: string | null };
  schoolName: string;
  schoolLogo: string;
};

export function DashboardPageHeader({
  user,
  schoolName,
  schoolLogo,
}: DashboardPageHeaderProps) {
  const firstName = user.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Parent";
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="sticky top-0 z-10 border-b border-border/60 bg-card"
      style={{ boxShadow: "0 1px 0 rgba(36,19,108,0.04)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <DashboardHeaderLogo
            schoolLogo={schoolLogo}
            schoolName={schoolName}
          />
          <div className="animate-fade-in border-l border-border pl-4 sm:pl-5">
            <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 shrink-0" />
              {now.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <form action={signOutAction} className="shrink-0">
          <Button type="submit" variant="outline" size="sm" className="gap-2">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
