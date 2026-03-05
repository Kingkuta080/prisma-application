"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type UserAvatarMenuProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

export function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const initials = getInitials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full p-0 sm:h-9 sm:w-9"
          aria-label="Account menu"
        >
          {user.image ? (
            <span className="relative block h-full w-full">
              <Image
                src={user.image}
                alt=""
                fill
                className="rounded-full object-cover"
                sizes="36px"
              />
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary sm:text-sm">
              {initials}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user.name && (
          <div className="px-2 py-1.5 text-sm font-medium text-foreground truncate">
            {user.name}
          </div>
        )}
        {user.email && (
          <div className="px-2 py-0 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/api/auth/signout?callbackUrl=/login"
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
