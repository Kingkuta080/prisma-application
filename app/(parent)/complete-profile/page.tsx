import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CompleteProfileForm } from "./complete-profile-form";
import { UserCircle } from "lucide-react";

export default async function CompleteProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const hasName = !!session.user.name?.trim();
  const hasPhone = !!session.user.phone?.trim();
  if (hasName && hasPhone) redirect("/");

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Page header — aligned with login/register card style */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <UserCircle className="size-5 text-primary" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Complete Your Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This information is required before you can submit applications.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Profile completion
            </span>
            <span className="text-xs font-semibold text-primary">
              Step 1 of 1
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-primary transition-all" />
          </div>
        </div>
      </div>

      {/* Form card — same treatment as register form card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7 md:p-8">
        <CompleteProfileForm
          defaultName={session.user.name ?? ""}
          defaultPhone={session.user.phone ?? ""}
        />
      </div>
    </div>
  );
}
