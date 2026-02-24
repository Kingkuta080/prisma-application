import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ApplicationFormPdf } from "@/components/application-form-pdf";
import { getSchoolConfig } from "@/lib/school-config";

export type ApplicationPdfProps = {
  wardName: string;
  wardDob: string;
  wardGender: string;
  sessionYear: number;
  applicationId: string;
  class?: string | null;
  amount: number;
  paymentDate?: string;
  paymentStatus: string;
};

export async function generateApplicationPdfBuffer(
  props: ApplicationPdfProps
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

  const element = React.createElement(ApplicationFormPdf, merged);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
