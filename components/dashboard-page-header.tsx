import { DashboardHeaderLogo } from "@/components/dashboard-header-logo";
import { UserAvatarMenu } from "@/components/user-avatar-menu";

type DashboardPageHeaderProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  schoolName: string;
  schoolLogo: string;
};

export function DashboardPageHeader({
  user,
  schoolName,
  schoolLogo,
}: DashboardPageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-card shadow-[0_1px_0_rgba(36,19,108,0.04)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <DashboardHeaderLogo
          schoolLogo={schoolLogo}
          schoolName={schoolName}
        />
        <UserAvatarMenu user={user} />
      </div>
    </header>
  );
}
