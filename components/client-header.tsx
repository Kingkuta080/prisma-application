"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";

type ClientHeaderProps = {
  user: { name?: string | null; email?: string | null };
  schoolName: string;
  schoolLogo: string;
};

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-application", label: "New Application", icon: FilePlus2 },
];

export function ClientHeader({ user, schoolName, schoolLogo }: ClientHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    user.name?.trim() || user.email?.split("@")[0] || "Parent";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      {/* School branding */}
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/20">
          <Image
            src={schoolLogo}
            alt=""
            fill
            className="object-contain p-1.5 bg-white"
            sizes="80px"
            unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
            }}
          />
          <GraduationCap
            className="size-5 text-white/80"
            style={{ display: "none" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[15px] font-semibold leading-tight text-white">
            {schoolName}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
            Parent Portal
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/8" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/35">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/14 text-white shadow-sm"
                  : "text-white/55 hover:bg-white/8 hover:text-white/90"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-white/18 text-white" : "text-white/50 group-hover:text-white/80"
                }`}
              >
                <Icon className="size-[15px]" />
              </span>
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-5 h-px bg-white/8" />

      {/* User section */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white ring-1 ring-white/30">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-white/45">{user.email}</p>
          </div>
        </div>
        <form action={signOutAction} className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/45 transition-colors hover:bg-white/8 hover:text-white/80"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex"
        style={{
          background:
            "linear-gradient(175deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 88%, black) 100%)",
        }}
      >
        <SidebarInner />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden"
        style={{
          background: "var(--brand-primary)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-white/15">
            <Image
              src={schoolLogo}
              alt=""
              fill
              className="object-contain p-1"
              sizes="28px"
              unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
            />
          </span>
          <span className="font-heading text-[15px] font-semibold text-white">
            {schoolName}
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/12 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 w-72 flex flex-col"
            style={{
              background:
                "linear-gradient(175deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 88%, black) 100%)",
            }}
          >
            <div className="flex h-14 items-center justify-between px-5">
              <span className="font-heading text-[15px] font-semibold text-white">
                {schoolName}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/12 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarInner />
          </aside>
        </div>
      )}
    </>
  );
}
