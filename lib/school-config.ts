/**
 * School branding and theme config from environment variables.
 * Used server-side for layout injection and passed to components.
 * Colors match the design system: HSL (e.g. "240 57% 27%") or hex.
 */

const defaults = {
  schoolName: "Prisma Academy",
  schoolDescription:
    "Primary School is a school that provides quality education to help students grow academically and personally.",
  schoolLogo: "/logo.png",
  /** Navy – primary (matches :root --primary) */
  colorPrimary: "240 57% 27%",
  /** Sky – secondary/accent (matches :root --secondary / --accent) */
  colorSecondary: "197 67% 44%",
  colorAccent: "197 67% 44%",
} as const;

export type SchoolConfig = {
  schoolName: string;
  schoolDescription: string;
  schoolLogo: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
};

function fromEnv(key: string, fallback: string): string {
  const raw = process.env[key]?.trim() ?? "";
  const value = raw.replace(/^["']|["']$/g, "").trim();
  return value || fallback;
}

export function getSchoolConfig(): SchoolConfig {
  return {
    schoolName: fromEnv("NEXT_PUBLIC_SCHOOL_NAME", defaults.schoolName),
    schoolDescription: fromEnv(
      "NEXT_PUBLIC_SCHOOL_DESCRIPTION",
      defaults.schoolDescription
    ),
    schoolLogo: fromEnv("NEXT_PUBLIC_SCHOOL_LOGO", defaults.schoolLogo),
    colorPrimary: fromEnv("NEXT_PUBLIC_COLOR_PRIMARY", defaults.colorPrimary),
    colorSecondary: fromEnv(
      "NEXT_PUBLIC_COLOR_SECONDARY",
      defaults.colorSecondary
    ),
    colorAccent: fromEnv("NEXT_PUBLIC_COLOR_ACCENT", defaults.colorAccent),
  };
}

/** True if value looks like HSL components (e.g. "240 57% 27%"). */
function isHsl(value: string): boolean {
  return /^\d+\s+\d+%\s+\d+%$/.test(value.trim());
}

/** Serialize brand color for CSS: hsl(...) or hex. */
function toCssColor(value: string): string {
  const v = value.trim();
  return isHsl(v) ? `hsl(${v})` : v;
}

/**
 * Returns CSS custom property overrides for :root so layout can inject
 * brand colors from env. Supports HSL (e.g. "240 57% 27%") or hex.
 * Also sets design tokens (--navy, --sky, gradients) from the same palette.
 */
export function getSchoolColorStyleBlock(config: SchoolConfig): string {
  const { colorPrimary, colorSecondary, colorAccent } = config;
  const primary = toCssColor(colorPrimary);
  const secondary = toCssColor(colorSecondary);
  const accent = toCssColor(colorAccent);
  const primaryHsl = isHsl(colorPrimary.trim()) ? colorPrimary.trim() : null;
  const secondaryHsl = isHsl(colorSecondary.trim()) ? colorSecondary.trim() : null;
  const navy = primaryHsl ?? "240 57% 27%";
  const sky = secondaryHsl ?? "197 67% 44%";
  const light = "180 75% 96%";
  const gradientPrimary =
    primaryHsl && secondaryHsl
      ? `linear-gradient(135deg, hsl(${primaryHsl}), hsl(${secondaryHsl}))`
      : `linear-gradient(135deg, ${primary}, ${secondary})`;
  const gradientHero =
    primaryHsl && secondaryHsl
      ? `linear-gradient(135deg, hsl(${primaryHsl} / 0.85), hsl(${secondaryHsl} / 0.7))`
      : gradientPrimary;

  return `:root {
  --brand-primary: ${primary};
  --brand-secondary: ${secondary};
  --brand-accent: ${accent};
  --navy: ${navy};
  --sky: ${sky};
  --light: ${light};
  --gradient-primary: ${gradientPrimary};
  --gradient-hero: ${gradientHero};
  --shadow-card: 0 4px 20px hsl(${primaryHsl ?? navy} / 0.08);
  --shadow-card-hover: 0 8px 30px hsl(${primaryHsl ?? navy} / 0.15);
  --shadow-nav: 0 2px 20px hsl(${primaryHsl ?? navy} / 0.1);
}`;
}
