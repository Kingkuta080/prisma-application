import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { getSchoolConfig, getSchoolColorStyleBlock } from "@/lib/school-config";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = getSchoolConfig();
  return {
    title: config.schoolName,
    description: config.schoolDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getSchoolConfig();
  const colorStyle = getSchoolColorStyleBlock(config);

  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
        {/* Injected last so it overrides globals.css and env-driven brand colors apply */}
        <style dangerouslySetInnerHTML={{ __html: colorStyle }} />
      </body>
    </html>
  );
}
