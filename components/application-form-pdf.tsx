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
    day: "2-digit",
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

export type ApplicationFormPdfProps = {
  wardName: string;
  wardDob: string;
  wardGender: string;
  sessionYear: number;
  applicationId: string;
  class?: string | null;
  amount?: number;
  paymentDate?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
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
  class: studentClass,
  amount = 0,
  paymentDate,
  paymentStatus = "PENDING",
  paymentReference,
  parentName,
  parentEmail,
  parentPhone,
  schoolName,
  schoolDescription,
  logoUrl,
  colorPrimary,
}: ApplicationFormPdfProps) {
  const isPaid = paymentStatus === "PAID" || paymentStatus === "COMPLETED";
  const displayDate = paymentDate ? formatDate(paymentDate) : formatDate(new Date().toISOString());
  const sessionLabel = `${sessionYear - 1}/${sessionYear}`;
  const receiptNo = `RCP-${applicationId.slice(0, 8).toUpperCase()}`;

  const s = StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 10,
      color: "#1a1a2e",
      backgroundColor: "#ffffff",
    },

    /* ── Letterhead ──────────────────────────────────────────── */
    letterhead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingHorizontal: 36,
      paddingVertical: 22,
    },
    logoWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoImg: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: "#f3f4f6",
    },
    schoolBlock: { flexDirection: "column" },
    schoolNameTxt: {
      fontSize: 15,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
      letterSpacing: 0.3,
    },
    schoolDescTxt: {
      fontSize: 8,
      color: "#6b7280",
      marginTop: 3,
    },
    receiptBadge: {
      backgroundColor: "#f3f4f6",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    receiptBadgeTxt: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: "#374151",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },

    /* ── Reference banner ────────────────────────────────────── */
    refBanner: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: 0,
      backgroundColor: "#f9fafb",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingHorizontal: 36,
      paddingVertical: 16,
    },
    refGroup: {
      flexDirection: "column",
      gap: 2,
      paddingVertical: 4,
      paddingRight: 28,
      borderRightWidth: 1,
      borderRightColor: "#e5e7eb",
      marginRight: 28,
    },
    refGroupLast: {
      borderRightWidth: 0,
      marginRight: 0,
      paddingRight: 0,
    },
    refCaption: {
      fontSize: 7,
      color: "#9ca3af",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    refCode: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
      letterSpacing: 0.5,
    },
    refMeta: { fontSize: 8, color: "#6b7280" },

    /* ── Body wrapper ────────────────────────────────────────── */
    body: { paddingHorizontal: 36, paddingTop: 24, paddingBottom: 80 },

    /* ── Info grid (student + parent) ────────────────────────── */
    infoGrid: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 20,
    },
    infoCard: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 6,
      overflow: "hidden",
    },
    infoCardHead: {
      backgroundColor: "#f9fafb",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    infoCardHeadTxt: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: "#374151",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    infoCardBody: { paddingHorizontal: 12, paddingVertical: 10 },
    infoRow: {
      flexDirection: "row",
      marginBottom: 7,
    },
    infoLabel: { width: 80, fontSize: 8.5, color: "#9ca3af" },
    infoValue: {
      flex: 1,
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },

    /* ── Payment table ───────────────────────────────────────── */
    tableWrap: {
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 0,
    },
    tableHead: {
      flexDirection: "row",
      backgroundColor: "#f9fafb",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    thTxt: {
      fontSize: 7.5,
      fontFamily: "Helvetica-Bold",
      color: "#6b7280",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    colDesc: { flex: 1 },
    colSess: { width: 90 },
    colAmt: { width: 90, textAlign: "right" as const },
    tableRow: {
      flexDirection: "row",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
    },
    tdTxt: { fontSize: 9.5, color: "#374151" },
    tdBold: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#111827" },
    totalRow: {
      flexDirection: "row",
      paddingHorizontal: 14,
      paddingVertical: 13,
      backgroundColor: "#f9fafb",
      borderTopWidth: 2,
      borderTopColor: colorPrimary,
    },
    totalLabel: {
      flex: 1,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#374151",
      textAlign: "right" as const,
      paddingRight: 14,
    },
    totalAmt: {
      width: 90,
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: colorPrimary,
      textAlign: "right" as const,
    },

    /* ── Paid confirmation strip ─────────────────────────────── */
    paidStrip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      borderWidth: 1,
      borderColor: isPaid ? "#bbf7d0" : "#fed7aa",
      borderRadius: 6,
      backgroundColor: isPaid ? "#f0fdf4" : "#fff7ed",
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    paidLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    paidDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isPaid ? "#16a34a" : "#ea580c",
      marginRight: 6,
    },
    paidStatusTxt: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: isPaid ? "#15803d" : "#c2410c",
    },
    paidRefTxt: {
      fontSize: 8.5,
      color: isPaid ? "#4ade80" : "#fdba74",
    },
    paidRef: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: isPaid ? "#15803d" : "#c2410c",
      letterSpacing: 0.5,
    },

    /* ── Notice ──────────────────────────────────────────────── */
    notice: {
      marginTop: 20,
      borderLeftWidth: 3,
      borderLeftColor: colorPrimary,
      paddingLeft: 10,
      paddingVertical: 4,
    },
    noticeTxt: { fontSize: 8, color: "#6b7280", lineHeight: 1.6 },

    /* ── Footer ──────────────────────────────────────────────── */
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      backgroundColor: "#f9fafb",
      paddingHorizontal: 36,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerLeft: { fontSize: 7.5, color: "#9ca3af" },
    footerRight: {
      fontSize: 7.5,
      color: "#6b7280",
      fontFamily: "Helvetica-Bold",
    },

    /* ── Watermark ───────────────────────────────────────────── */
    watermarkWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    watermarkImg: { width: 220, height: 220, opacity: 0.04 },
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Watermark */}
        {logoUrl && (
          <View style={s.watermarkWrap} fixed>
            <Image src={logoUrl} style={s.watermarkImg} />
          </View>
        )}

        {/* ── Letterhead ── */}
        <View style={s.letterhead} fixed>
          <View style={s.logoWrap}>
            {logoUrl ? (
              <Image src={logoUrl} style={s.logoImg} />
            ) : (
              <View style={s.logoImg} />
            )}
            <View style={s.schoolBlock}>
              <Text style={s.schoolNameTxt}>{schoolName}</Text>
              <Text style={s.schoolDescTxt}>{schoolDescription}</Text>
            </View>
          </View>
        </View>

        {/* ── Reference banner ── */}
        <View style={s.refBanner}>
          <View style={s.refGroup}>
            <Text style={s.refCaption}>Receipt no</Text>
            <Text style={s.refCode}>{receiptNo}</Text>
          </View>
          <View style={s.refGroup}>
            <Text style={s.refCaption}>Date</Text>
            <Text style={s.refCode}>{displayDate}</Text>
          </View>
          {paymentReference && (
            <View style={s.refGroup}>
              <Text style={s.refCaption}>Payment ref</Text>
              <Text style={s.refCode}>{paymentReference.toUpperCase()}</Text>
            </View>
          )}
          <View style={[s.refGroup, s.refGroupLast]}>
            <Text style={s.refCaption}>Session</Text>
            <Text style={s.refCode}>{sessionLabel}</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Student + Parent cards */}
          <View style={s.infoGrid}>
            {/* Applicant */}
            <View style={s.infoCard}>
              <View style={s.infoCardHead}>
                <Text style={s.infoCardHeadTxt}>Applicant Information</Text>
              </View>
              <View style={s.infoCardBody}>
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Full Name</Text>
                  <Text style={s.infoValue}>{wardName}</Text>
                </View>
                {studentClass ? (
                  <View style={s.infoRow}>
                    <Text style={s.infoLabel}>Class</Text>
                    <Text style={s.infoValue}>{studentClass}</Text>
                  </View>
                ) : null}
                <View style={s.infoRow}>
                  <Text style={s.infoLabel}>Date of Birth</Text>
                  <Text style={s.infoValue}>{formatDate(wardDob)}</Text>
                </View>
                <View style={[s.infoRow, { marginBottom: 0 }]}>
                  <Text style={s.infoLabel}>Gender</Text>
                  <Text style={s.infoValue}>
                    {wardGender.charAt(0).toUpperCase() +
                      wardGender.slice(1).toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Parent / Guardian */}
            <View style={s.infoCard}>
              <View style={s.infoCardHead}>
                <Text style={s.infoCardHeadTxt}>Parent / Guardian</Text>
              </View>
              <View style={s.infoCardBody}>
                {parentName ? (
                  <View style={s.infoRow}>
                    <Text style={s.infoLabel}>Full Name</Text>
                    <Text style={s.infoValue}>{parentName}</Text>
                  </View>
                ) : null}
                {parentPhone ? (
                  <View style={s.infoRow}>
                    <Text style={s.infoLabel}>Phone</Text>
                    <Text style={s.infoValue}>{parentPhone}</Text>
                  </View>
                ) : null}
                {parentEmail ? (
                  <View style={[s.infoRow, { marginBottom: 0 }]}>
                    <Text style={s.infoLabel}>Email</Text>
                    <Text style={s.infoValue}>{parentEmail}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Payment Table */}
          <View style={s.tableWrap}>
            <View style={s.tableHead}>
              <Text style={[s.thTxt, s.colDesc]}>Description</Text>
              <Text style={[s.thTxt, s.colSess]}>Session</Text>
              <Text style={[s.thTxt, s.colAmt]}>Amount</Text>
            </View>
            <View style={s.tableRow}>
              <Text style={[s.tdTxt, s.colDesc]}>Application Enrollment Fee</Text>
              <Text style={[s.tdTxt, s.colSess]}>{sessionLabel}</Text>
              <Text style={[s.tdBold, s.colAmt, { textAlign: "right" }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL PAID</Text>
              <Text style={s.totalAmt}>{formatCurrency(amount)}</Text>
            </View>
          </View>

          {/* Payment status strip */}
          <View style={s.paidStrip}>
            <View style={s.paidLeft}>
              <View style={s.paidDot} />
              <Text style={s.paidStatusTxt}>
                {isPaid ? "Payment Confirmed" : "Awaiting Payment"}
              </Text>
            </View>
            {paymentReference && (
              <Text style={s.paidRef}>Ref: {paymentReference.toUpperCase()}</Text>
            )}
          </View>

          {/* Notice */}
          <View style={s.notice}>
            <Text style={s.noticeTxt}>
              This is an official computer-generated payment receipt issued by{" "}
              {schoolName}. Please retain this document for your records. For
              enquiries contact the school admissions office with your payment
              reference number.
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            Generated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {"  ·  "}
            Receipt: {receiptNo}
          </Text>
          <Text style={s.footerRight}>
            {schoolName} · {new Date().getFullYear()}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
