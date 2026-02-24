import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AdmissionLetterPdf } from "@/components/admission-letter-pdf";
import { getSchoolConfig, getPrimaryColorValue } from "@/lib/school-config";

type Props = {
  wardName: string;
  sessionYear: number;
  applicationId: string;
  admissionStatus: string;
  schoolName?: string;
  class?: string | null;
};

export async function generateAdmissionLetterPdfBuffer(
  props: Props
): Promise<Buffer> {
  const config = getSchoolConfig();
  const primaryColor = getPrimaryColorValue();
  const element = React.createElement(AdmissionLetterPdf, {
    ...props,
    schoolName: props.schoolName ?? config.schoolName,
    primaryColor,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
