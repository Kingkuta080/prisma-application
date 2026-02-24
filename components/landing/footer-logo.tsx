"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

type FooterLogoProps = {
  schoolLogo: string;
  alt?: string;
  className?: string;
};

export function FooterLogo({
  schoolLogo,
  alt = "School logo",
  className = "h-10 w-auto",
}: FooterLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !schoolLogo) {
    return (
      <span className="inline-flex items-center" aria-hidden>
        <GraduationCap className={className} />
      </span>
    );
  }

  return (
    <Image
      src={schoolLogo}
      alt={alt}
      width={120}
      height={40}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
