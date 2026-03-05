import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

type AdmissionLetterPdfProps = {
  wardName: string;
  sessionYear: number;
  applicationId: string;
  admissionStatus: string;
  class?: string | null;
  schoolName: string;
  schoolDescription: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
};

function formatLetterDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
}

export function AdmissionLetterPdf({
  wardName,
  sessionYear,
  applicationId,
  admissionStatus,
  class: className,
  schoolName,
  schoolDescription,
  logoUrl,
  colorPrimary,
  colorSecondary,
  colorAccent,
}: AdmissionLetterPdfProps) {
  const isOfferedOrAccepted =
    admissionStatus === "OFFERED" || admissionStatus === "ACCEPTED";

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colorPrimary,
      marginHorizontal: -40,
      marginTop: -40,
      marginBottom: 0,
      paddingVertical: 20,
      paddingHorizontal: 28,
    },
    logo: {
      width: 52,
      height: 52,
      borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginRight: 14,
    },
    headerText: { flex: 1 },
    schoolName: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 4,
      fontFamily: "Helvetica-Bold",
    },
    schoolDescription: {
      fontSize: 9,
      color: "rgba(255,255,255,0.85)",
      marginBottom: 6,
    },
    letterLabel: {
      fontSize: 8,
      color: "rgba(255,255,255,0.7)",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    rule: {
      height: 3,
      backgroundColor: colorAccent,
      marginHorizontal: -40,
      marginBottom: 20,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 6,
    },
    letterTitle: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
    },
    refText: { fontSize: 8, color: "#666" },
    dateText: { fontSize: 10, color: "#666", marginBottom: 20 },
    toLabel: {
      fontSize: 9,
      color: "#666",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    wardNameLarge: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
      marginBottom: 14,
    },
    infoPanel: {
      backgroundColor: colorSecondary,
      padding: 14,
      marginBottom: 18,
      borderRadius: 2,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    infoItem: { fontSize: 10, marginRight: 16 },
    infoLabel: { color: "#666" },
    infoValue: { fontFamily: "Helvetica-Bold", color: "#333" },
    statusBadge: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: colorAccent,
      marginTop: 4,
    },
    body: {
      fontSize: 10,
      lineHeight: 1.55,
      color: "#333",
      marginBottom: 20,
    },
    bodyParagraph: { marginBottom: 10 },
    signOff: {
      marginTop: 24,
      marginBottom: 6,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
    },
    signLine: {
      width: 180,
      borderBottomWidth: 1,
      borderBottomColor: "#333",
      marginBottom: 6,
    },
    signTitle: { fontSize: 9, color: "#666", marginBottom: 2 },
    signSchool: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
    },
    footer: {
      position: "absolute",
      bottom: 28,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: "#e5e5e5",
      paddingTop: 14,
    },
    footerText: { fontSize: 8, color: "#888", textAlign: "center" },
    watermarkWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 0,
    },
    watermarkLogo: { width: 200, height: 200, opacity: 0.06 },
    watermarkText: {
      fontSize: 48,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
      opacity: 0.05,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    contentWrap: { position: "relative" as const, zIndex: 1 },
  });

  const statusLabel =
    admissionStatus === "ACCEPTED"
      ? "ADMISSION ACCEPTED"
      : admissionStatus === "OFFERED"
        ? "ADMISSION OFFERED"
        : admissionStatus;

  const bodyText = isOfferedOrAccepted
    ? `We are pleased to inform you that ${wardName} has been ${admissionStatus === "ACCEPTED" ? "accepted" : "offered a place"} for admission to ${schoolName} for the ${sessionYear} academic session${className ? ` in ${className}` : ""}.`
    : `This letter is regarding the admission status (${admissionStatus}) for ${wardName} for the ${sessionYear} session.`;

  const bodyText2 = isOfferedOrAccepted
    ? "Please retain this letter as confirmation of admission. Further instructions regarding resumption and required documents will be communicated separately."
    : "Please contact the admissions office if you have any questions.";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermarkWrap}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.watermarkLogo} />
          ) : (
            <Text style={styles.watermarkText}>{schoolName}</Text>
          )}
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.header}>
            {logoUrl ? (
              <Image src={logoUrl} style={styles.logo} />
            ) : (
              <View style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.schoolName}>{schoolName}</Text>
              <Text style={styles.schoolDescription}>{schoolDescription}</Text>
              <Text style={styles.letterLabel}>Admission Letter</Text>
            </View>
          </View>
          <View style={styles.rule} />

          <View style={styles.titleRow}>
            <Text style={styles.letterTitle}>ADMISSION LETTER</Text>
            <Text style={styles.refText}>Ref: {applicationId.slice(0, 12)}</Text>
          </View>
          <Text style={styles.dateText}>{formatLetterDate()}</Text>

          <Text style={styles.toLabel}>To the Parent/Guardian of:</Text>
          <Text style={styles.wardNameLarge}>{wardName}</Text>

          <View style={styles.infoPanel}>
            {className != null && className !== "" && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Class </Text>
                <Text style={styles.infoValue}>{className}</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Session </Text>
              <Text style={styles.infoValue}>
                {sessionYear - 1} / {sessionYear}
              </Text>
            </View>
            <View style={{ width: "100%" }}>
              <Text style={styles.statusBadge}>Status: {statusLabel}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.bodyParagraph}>Dear Parent/Guardian,</Text>
            <Text style={styles.bodyParagraph}>{bodyText}</Text>
            <Text style={styles.bodyParagraph}>{bodyText2}</Text>
          </View>

          <Text style={styles.signOff}>Yours faithfully,</Text>
          <View style={styles.signLine} />
          <Text style={styles.signTitle}>The Admissions Office</Text>
          <Text style={styles.signSchool}>{schoolName}</Text>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              This letter is computer-generated. Issued: {formatShortDate()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
