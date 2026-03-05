"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";

type FooterLogoProps = {
  schoolLogo: string;
};

export function FooterLogo({ schoolLogo }: FooterLogoProps) {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/8 ring-1 ring-primary/15 transition group-hover:bg-primary/12">
      <Image
        src={schoolLogo}
        alt=""
        fill
        className="object-contain p-1.5"
        sizes="36px"
        unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
        }}
      />
      <GraduationCap className="size-4 text-primary" style={{ display: "none" }} />
    </span>
  );
}
