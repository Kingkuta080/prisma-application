"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

type SchoolLogoProps = {
  schoolLogo: string;
  wrapperClassName?: string;
  fallbackIconClassName?: string;
  size?: number;
};

export function SchoolLogo({
  schoolLogo,
  wrapperClassName = "",
  fallbackIconClassName = "size-10",
  size = 40,
}: SchoolLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !schoolLogo) {
    return (
      <span className={wrapperClassName}>
        <GraduationCap className={fallbackIconClassName} aria-hidden />
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${wrapperClassName}`}>
      <Image
        src={schoolLogo}
        alt=""
        width={size}
        height={size}
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
