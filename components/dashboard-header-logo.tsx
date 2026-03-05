"use client";

import Link from "next/link";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

type DashboardHeaderLogoProps = {
  schoolLogo: string;
  schoolName: string;
};

export function DashboardHeaderLogo({ schoolLogo, schoolName }: DashboardHeaderLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/20 sm:h-10 sm:w-10 sm:rounded-xl">
        {failed ? (
          <GraduationCap className="size-4 text-primary sm:size-5" />
        ) : (
          <>
            <Image
              src={schoolLogo}
              alt=""
              fill
              className="object-contain p-1 sm:p-1.5"
              sizes="40px"
              unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
              onError={() => setFailed(true)}
            />
          </>
        )}
      </span>
      <span className="font-heading truncate text-base font-semibold text-foreground sm:text-lg">
        {schoolName}
      </span>
    </Link>
  );
}
