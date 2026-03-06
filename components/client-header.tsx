"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LogOut,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/logout-confirm-modal";

export type ClientHeaderProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  schoolName: string;
  schoolLogo: string;
};

const NAV_ITEMS: { href: string; label: string; icon: React.ElementType }[] = [];

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function ClientHeader({ user, schoolName, schoolLogo }: ClientHeaderProps) {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on any click outside the menu container
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [userMenuOpen]);

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Parent";
  const firstName = displayName.split(" ")[0];
  const initials = getInitials(user.name, user.email);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-3 sm:px-6">

          {/* ── Brand ────────────────────────────────────────────────────── */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Image
                src={schoolLogo}
                alt=""
                fill
                className="bg-white object-contain p-1.5"
                sizes="32px"
                unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
                }}
              />
              <GraduationCap
                className="m-auto size-4 text-primary"
                style={{ display: "none" }}
              />
            </span>
            <span className="hidden text-[13px] font-semibold text-foreground sm:block">
              {schoolName}
            </span>
          </Link>

          {/* ── Nav links ────────────────────────────────────────────────── */}
          <nav className="flex flex-1 items-center gap-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="hidden xs:inline sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── User menu ────────────────────────────────────────────────── */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                {initials}
              </span>
              <span className="hidden max-w-[120px] truncate sm:block">{firstName}</span>
              <ChevronDown className={`hidden size-3.5 text-muted-foreground/60 transition-transform sm:block ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-border bg-background p-1 shadow-lg">
                  {/* User info */}
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  {/* Nav items (mobile convenience) */}
                  <div className="py-1">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </header>

      <LogoutConfirmModal open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
