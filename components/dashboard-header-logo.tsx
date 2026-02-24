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
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
        {failed ? (
          <GraduationCap className="size-5 text-primary" />
        ) : (
          <>
            <Image
              src={schoolLogo}
              alt=""
              fill
              className="object-contain p-1.5"
              sizes="40px"
              unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
              onError={() => setFailed(true)}
            />
          </>
        )}
      </span>
      <span className="font-heading text-lg font-semibold text-foreground">
        {schoolName}
      </span>
    </Link>
  );
}
