/**
 * School branding: single source of truth from NEXT_PUBLIC_SCHOOL_* and NEXT_PUBLIC_COLOR_* env vars.
 */

function fromEnv(key: string): string {
  const v = process.env[key];
  if (v == null || v === "") return "";
  return String(v).replace(/^["']|["']$/g, "").trim();
}

export type SchoolConfig = {
  schoolName: string;
  schoolDescription: string;
  schoolLogo: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
};

const DEFAULTS: SchoolConfig = {
  schoolName: "School Enrollment Platform",
  schoolDescription: "Parent portal for school enrollment",
  schoolLogo: "/logo.png",
  colorPrimary: "240 57% 27%",
  colorSecondary: "197 67% 44%",
  colorAccent: "197 67% 44%",
};

export function getSchoolConfig(): SchoolConfig {
  return {
    schoolName: fromEnv("NEXT_PUBLIC_SCHOOL_NAME") || DEFAULTS.schoolName,
    schoolDescription:
      fromEnv("NEXT_PUBLIC_SCHOOL_DESCRIPTION") || DEFAULTS.schoolDescription,
    schoolLogo: fromEnv("NEXT_PUBLIC_SCHOOL_LOGO") || DEFAULTS.schoolLogo,
    colorPrimary:
      fromEnv("NEXT_PUBLIC_COLOR_PRIMARY") || DEFAULTS.colorPrimary,
    colorSecondary:
      fromEnv("NEXT_PUBLIC_COLOR_SECONDARY") || DEFAULTS.colorSecondary,
    colorAccent: fromEnv("NEXT_PUBLIC_COLOR_ACCENT") || DEFAULTS.colorAccent,
  };
}

/** Normalize color to a CSS value: hex stays as-is, "H S% L%" becomes "hsl(H S% L%)". */
function toCssColor(raw: string): string {
  const s = raw.trim();
  if (s.startsWith("#")) return s;
  if (/^\d+\s+\d+%\s+\d+%$/.test(s)) return `hsl(${s})`;
  return s;
}

/**
 * Generate a :root {} CSS block. Only primary, secondary, and accent are driven by env; the rest of the UI uses these.
 * Supports hex (e.g. #24136c) and HSL (e.g. 240 57% 27%) from env.
 */
export function getSchoolColorStyleBlock(): string {
  const c = getSchoolConfig();
  const primary = toCssColor(c.colorPrimary);
  const secondary = toCssColor(c.colorSecondary);
  const accent = toCssColor(c.colorAccent);

  return `:root {
  --brand-primary: ${primary};
  --brand-secondary: ${secondary};
  --brand-accent: ${accent};
  --primary: var(--brand-primary);
  --secondary: var(--brand-secondary);
  --accent: var(--brand-accent);
  --ring: var(--brand-primary);
  --sidebar-primary: var(--brand-primary);
  --sidebar-ring: var(--brand-primary);
}`;
}

/** Color as a CSS value (hex or hsl) for use in PDFs / non-CSS contexts. */
export function getPrimaryColorValue(): string {
  return toCssColor(getSchoolConfig().colorPrimary);
}

export function getSecondaryColorValue(): string {
  return toCssColor(getSchoolConfig().colorSecondary);
}

export function getAccentColorValue(): string {
  return toCssColor(getSchoolConfig().colorAccent);
}

/** Resolved logo URL for PDF (absolute if possible for react-pdf Image). */
export function getSchoolLogoUrl(): string | null {
  const config = getSchoolConfig();
  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "";
  if (config.schoolLogo.startsWith("http")) return config.schoolLogo;
  if (appUrl) {
    const base = appUrl.replace(/\/$/, "");
    const path = config.schoolLogo.startsWith("/") ? config.schoolLogo : `/${config.schoolLogo}`;
    return `${base}${path}`;
  }
  return null;
}
