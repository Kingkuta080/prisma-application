import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ApplicationFormPdf } from "@/components/application-form-pdf";
import {
  getSchoolConfig,
  getPrimaryColorValue,
  getSecondaryColorValue,
  getAccentColorValue,
  getSchoolLogoUrl,
} from "@/lib/school-config";

type Props = {
  wardName: string;
  wardDob: string;
  wardGender: string;
  sessionYear: number;
  applicationId: string;
  class?: string | null;
  amount?: number;
  paymentDate?: string | null;
  paymentStatus?: string | null;
};

export async function generateApplicationPdfBuffer(
  props: Props
): Promise<Buffer> {
  const config = getSchoolConfig();
  const logoUrl = getSchoolLogoUrl();
  const element = React.createElement(ApplicationFormPdf, {
    ...props,
    schoolName: config.schoolName,
    schoolDescription: config.schoolDescription,
    logoUrl,
    colorPrimary: getPrimaryColorValue(),
    colorSecondary: getSecondaryColorValue(),
    colorAccent: getAccentColorValue(),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
