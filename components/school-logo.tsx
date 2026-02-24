"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";

type SchoolLogoProps = {
  schoolLogo: string;
  wrapperClassName?: string;
  fallbackIconClassName?: string;
  size?: number;
};

export function SchoolLogo({
  schoolLogo,
  wrapperClassName = "flex items-center justify-center overflow-hidden rounded-xl bg-primary/8 ring-1 ring-primary/15",
  fallbackIconClassName = "size-5 text-primary",
  size = 40,
}: SchoolLogoProps) {
  return (
    <span
      className={wrapperClassName}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Image
        src={schoolLogo}
        alt=""
        width={size}
        height={size}
        className="object-contain p-1"
        sizes={`${size}px`}
        unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
        }}
      />
      <GraduationCap className={fallbackIconClassName} style={{ display: "none" }} />
    </span>
  );
}
