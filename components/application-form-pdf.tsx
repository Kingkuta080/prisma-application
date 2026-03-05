import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
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
  schoolName: string;
  schoolDescription: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
};

export function ApplicationFormPdf({
  wardName,
  wardDob,
  wardGender,
  sessionYear,
  applicationId,
  class: className,
  amount = 0,
  paymentDate,
  paymentStatus = "—",
  schoolName,
  schoolDescription,
  logoUrl,
  colorPrimary,
  colorSecondary,
  colorAccent,
}: ApplicationFormPdfProps) {
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
    receiptLabel: {
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
    sectionLabel: {
      fontSize: 7,
      fontWeight: "bold",
      letterSpacing: 1.5,
      color: colorPrimary,
      textTransform: "uppercase",
      marginBottom: 8,
      fontFamily: "Helvetica-Bold",
    },
    twoCol: { flexDirection: "row", marginBottom: 18 },
    col: { flex: 1 },
    metaRow: { flexDirection: "row", marginBottom: 6 },
    metaLabel: { width: 110, fontSize: 9, color: "#666" },
    metaValue: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold" },
    table: {
      marginBottom: 14,
      borderWidth: 1,
      borderColor: "#e0e0e0",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: colorPrimary,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tableHeaderText: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    thDesc: { width: "50%" },
    thSession: { width: "22%" },
    thAmount: { width: "28%", textAlign: "right" as const },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: "#eee",
    },
    tableRowAlt: { backgroundColor: "#f5f5f5" },
    tdDesc: { width: "50%", fontSize: 10 },
    tdSession: { width: "22%", fontSize: 10 },
    tdAmount: { width: "28%", fontSize: 10, textAlign: "right" as const },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 2,
      borderTopColor: colorAccent,
    },
    totalLabel: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      marginRight: 12,
      color: "#333",
    },
    totalValue: {
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
      color: colorAccent,
    },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
    statusLabel: { fontSize: 9, color: "#666", marginRight: 8 },
    statusBadge: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: "#15803d",
      backgroundColor: "#f0fdf4",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 2,
    },
    statusBadgePending: {
      color: "#b45309",
      backgroundColor: "#fff7ed",
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
    footerText: {
      fontSize: 8,
      color: "#888",
      textAlign: "center",
      marginBottom: 4,
    },
    footerSchool: {
      fontSize: 8,
      color: "#666",
      textAlign: "center",
      fontFamily: "Helvetica-Bold",
    },
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

  const isPaid =
    paymentStatus === "PAID" || paymentStatus === "COMPLETED";
  const displayDate = paymentDate
    ? formatDate(paymentDate)
    : "—";

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
              <Text style={styles.receiptLabel}>Application Receipt</Text>
            </View>
          </View>
          <View style={styles.rule} />

          <Text style={styles.sectionLabel}>Receipt & Student Details</Text>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Receipt No</Text>
                <Text style={styles.metaValue}>{applicationId.slice(0, 12)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{displayDate}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Session</Text>
                <Text style={styles.metaValue}>
                  {sessionYear - 1} / {sessionYear}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status</Text>
                <Text style={styles.metaValue}>{paymentStatus}</Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Student name</Text>
                <Text style={styles.metaValue}>{wardName}</Text>
              </View>
              {className != null && className !== "" && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Class</Text>
                  <Text style={styles.metaValue}>{className}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date of birth</Text>
                <Text style={styles.metaValue}>{wardDob}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Gender</Text>
                <Text style={styles.metaValue}>{wardGender}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Payment Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.thDesc]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.thSession]}>
                Session
              </Text>
              <Text style={[styles.tableHeaderText, styles.thAmount]}>
                Amount
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.tdDesc}>Application Fee</Text>
              <Text style={styles.tdSession}>{sessionYear}</Text>
              <Text style={styles.tdAmount}>{formatCurrency(amount)}</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAID</Text>
            <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment status</Text>
            <Text
              style={
                isPaid
                  ? styles.statusBadge
                  : [styles.statusBadge, styles.statusBadgePending]
              }
            >
              {isPaid ? "PAID" : paymentStatus}
            </Text>
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
              This is a computer-generated receipt. Not valid without the
              school&apos;s official stamp.
            </Text>
            <Text style={styles.footerSchool}>
              {schoolName} · © {new Date().getFullYear()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
