import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientHeader } from "@/components/client-header";
import { getSchoolConfig } from "@/lib/school-config";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { schoolName, schoolLogo } = getSchoolConfig();

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader
        user={session.user}
        schoolName={schoolName}
        schoolLogo={schoolLogo}
      />
      <main className="pt-14 md:pt-0 md:pl-64">
        <div className="mx-auto max-w-4xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}
