import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AdmissionLetterPdf } from "@/components/admission-letter-pdf";
import { getSchoolConfig } from "@/lib/school-config";

export type AdmissionLetterPdfProps = {
  wardName: string;
  sessionYear: number;
  applicationId: string;
  admissionStatus: string;
  class?: string | null;
};

export async function generateAdmissionLetterPdfBuffer(
  props: AdmissionLetterPdfProps
): Promise<Buffer> {
  const config = getSchoolConfig();
  const appUrl = process.env.APP_URL ?? "";
  const logoUrl = config.schoolLogo.startsWith("http")
    ? config.schoolLogo
    : appUrl
      ? `${appUrl.replace(/\/$/, "")}${config.schoolLogo.startsWith("/") ? "" : "/"}${config.schoolLogo}`
      : null;

  const merged = {
    ...props,
    schoolName: config.schoolName,
    schoolDescription: config.schoolDescription,
    logoUrl,
    colorPrimary: config.colorPrimary,
    colorSecondary: config.colorSecondary,
    colorAccent: config.colorAccent,
  };

  const element = React.createElement(AdmissionLetterPdf, merged);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
