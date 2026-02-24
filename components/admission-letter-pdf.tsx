import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const primaryDefault = "#24136c";

function createStyles(primaryColor: string) {
  return StyleSheet.create({
    page: { padding: 40, fontSize: 11 },
    letterhead: {
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      paddingBottom: 12,
      marginBottom: 24,
    },
    letterheadTitle: { fontSize: 20, fontWeight: "bold", color: primaryColor },
    letterheadSub: { fontSize: 11, color: "#666", marginTop: 4 },
    watermark: {
      position: "absolute",
      top: "35%",
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 42,
      color: primaryColor,
      opacity: 0.06,
    },
    statusPanel: {
      backgroundColor: "#f0f4ff",
      borderWidth: 1,
      borderColor: primaryColor,
      borderRadius: 4,
      padding: 12,
      marginBottom: 20,
    },
    statusLabel: { fontSize: 9, textTransform: "uppercase", color: "#666", marginBottom: 2 },
    statusValue: { fontSize: 14, fontWeight: "bold", color: primaryColor },
    row: { flexDirection: "row", marginBottom: 8 },
    label: { width: 120, fontWeight: "bold", color: "#333" },
    value: { flex: 1 },
    body: { marginTop: 20, fontSize: 11, lineHeight: 1.6 },
    signatureLine: { marginTop: 32, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#ccc", width: 200 },
    signatureLabel: { fontSize: 9, color: "#666", marginTop: 4 },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: "#eee",
      paddingTop: 8,
      fontSize: 9,
      color: "#666",
      textAlign: "center",
    },
  });
}

type AdmissionLetterPdfProps = {
  wardName: string;
  sessionYear: number;
  applicationId: string;
  admissionStatus: string;
  schoolName?: string;
  class?: string | null;
  primaryColor?: string;
};

export function AdmissionLetterPdf({
  wardName,
  sessionYear,
  applicationId,
  admissionStatus,
  schoolName = "School",
  class: className,
  primaryColor = primaryDefault,
}: AdmissionLetterPdfProps) {
  const styles = createStyles(primaryColor);
  const isOfferedOrAccepted =
    admissionStatus === "OFFERED" || admissionStatus === "ACCEPTED";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>
          <Text>{schoolName}</Text>
        </View>
        <View style={styles.letterhead}>
          <Text style={styles.letterheadTitle}>{schoolName}</Text>
          <Text style={styles.letterheadSub}>Admission Letter</Text>
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.statusLabel}>Admission status</Text>
          <Text style={styles.statusValue}>{admissionStatus}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Application ID:</Text>
          <Text style={styles.value}>{applicationId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Session year:</Text>
          <Text style={styles.value}>{sessionYear}</Text>
        </View>
        {className != null && className !== "" && (
          <View style={styles.row}>
            <Text style={styles.label}>Class:</Text>
            <Text style={styles.value}>{className}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Child name:</Text>
          <Text style={styles.value}>{wardName}</Text>
        </View>

        <Text style={styles.body}>
          {isOfferedOrAccepted
            ? `This letter confirms that ${wardName} has been ${admissionStatus === "ACCEPTED" ? "accepted" : "offered a place"} for the ${sessionYear} session. Please retain this letter for your records.`
            : `This letter is regarding the admission status (${admissionStatus}) for ${wardName} for the ${sessionYear} session.`}
        </Text>

        <View style={styles.signatureLine}>
          <Text style={styles.signatureLabel}>Authorized signature</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>{schoolName} — Admission letter. Official document.</Text>
        </View>
      </Page>
    </Document>
  );
}
