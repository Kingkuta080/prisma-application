import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { ClientHeader } from "@/components/client-header";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const config = getSchoolConfig();

  return (
    <>
      <ClientHeader
        user={session.user}
        schoolName={config.schoolName}
        schoolLogo={config.schoolLogo}
      />
      <main className="min-h-[calc(100vh-3.5rem)] bg-[#f9fafb]">
        <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </>
  );
}
