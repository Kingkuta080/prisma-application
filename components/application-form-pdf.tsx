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
    header: {
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      paddingBottom: 12,
      marginBottom: 20,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: primaryColor },
    headerSub: { fontSize: 10, color: "#666", marginTop: 2 },
    watermark: {
      position: "absolute",
      top: "40%",
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 48,
      color: primaryColor,
      opacity: 0.06,
    },
    twoCol: { flexDirection: "row", marginBottom: 10, gap: 40 },
    col: { flex: 1 },
    row: { flexDirection: "row", marginBottom: 6 },
    label: { width: 110, fontWeight: "bold", color: "#333" },
    value: { flex: 1 },
    table: { marginTop: 16, marginBottom: 16 },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6 },
    tableHeader: { flex: 1, fontWeight: "bold", fontSize: 10 },
    tableCell: { flex: 1, fontSize: 10 },
    totalsRow: { flexDirection: "row", marginTop: 8, paddingTop: 8, borderTopWidth: 2, borderTopColor: primaryColor, fontWeight: "bold" },
    footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8, fontSize: 9, color: "#666", textAlign: "center" },
  });
}

type ApplicationFormPdfProps = {
  wardName: string;
  wardDob: string;
  wardGender: string;
  sessionYear: number;
  applicationId: string;
  class?: string | null;
  amount?: number;
  paymentDate?: string | null;
  paymentStatus?: string | null;
  schoolName?: string;
  primaryColor?: string;
};

export function ApplicationFormPdf({
  wardName,
  wardDob,
  wardGender,
  sessionYear,
  applicationId,
  class: className,
  amount,
  paymentDate,
  paymentStatus,
  schoolName = "School",
  primaryColor = primaryDefault,
}: ApplicationFormPdfProps) {
  const styles = createStyles(primaryColor);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>
          <Text>{schoolName}</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{schoolName}</Text>
          <Text style={styles.headerSub}>Application Receipt</Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
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
          </View>
          <View style={styles.col}>
            <View style={styles.row}>
              <Text style={styles.label}>Ward name:</Text>
              <Text style={styles.value}>{wardName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of birth:</Text>
              <Text style={styles.value}>{wardDob}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{wardGender}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Description</Text>
            <Text style={styles.tableHeader}>Amount</Text>
            <Text style={styles.tableHeader}>Payment date</Text>
            <Text style={styles.tableHeader}>Status</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Application fee</Text>
            <Text style={styles.tableCell}>
              {amount != null ? `₦${Number(amount).toLocaleString("en-NG")}` : "—"}
            </Text>
            <Text style={styles.tableCell}>{paymentDate ?? "—"}</Text>
            <Text style={styles.tableCell}>{paymentStatus ?? "—"}</Text>
          </View>
        </View>
        {amount != null && (
          <View style={styles.totalsRow}>
            <Text style={styles.tableHeader}>Total</Text>
            <Text style={styles.tableCell}>
              ₦{Number(amount).toLocaleString("en-NG")}
            </Text>
            <Text style={styles.tableCell} />
            <Text style={styles.tableCell} />
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{schoolName} — Application receipt. Generated for your records.</Text>
        </View>
      </Page>
    </Document>
  );
}
