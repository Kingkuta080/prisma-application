import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompleteProfileForm } from "./complete-profile-form";
import { UserCircle } from "lucide-react";

export default async function CompleteProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const hasName = !!session.user.name?.trim();
  const hasPhone = !!session.user.phone?.trim();
  if (hasName && hasPhone) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      guardianFullName: true,
      residence: true,
      occupation: true,
      guardianPhone: true,
      guardianEmail: true,
      motherPhone: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UserCircle className="size-5 text-primary" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Complete Your Profile
            </h1>
            <p className="text-sm text-muted-foreground">
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

      {/* Form card — flush on mobile, rounded card on tablet+ */}
      <div className="bg-white p-4 sm:rounded-2xl sm:border sm:border-border sm:p-6 sm:shadow-sm md:p-8">
        <CompleteProfileForm
          defaultName={user?.name ?? session.user.name ?? ""}
          defaultPhone={user?.phone ?? session.user.phone ?? ""}
          defaultGuardianFullName={user?.guardianFullName ?? ""}
          defaultResidence={user?.residence ?? ""}
          defaultOccupation={user?.occupation ?? ""}
          defaultGuardianPhone={user?.guardianPhone ?? ""}
          defaultGuardianEmail={user?.guardianEmail ?? ""}
          defaultMotherPhone={user?.motherPhone ?? ""}
        />
      </div>
    </div>
  );
}
