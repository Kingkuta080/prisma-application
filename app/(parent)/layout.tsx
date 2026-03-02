import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { getSchoolConfig } from "@/lib/school-config";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const config = getSchoolConfig();

  return (
    <div className="min-h-screen bg-background">
      <DashboardPageHeader
        user={session.user}
        schoolName={config.schoolName}
        schoolLogo={config.schoolLogo}
      />
      <main>
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-5 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
