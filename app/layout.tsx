import type { Metadata } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/session-provider";
import { getSchoolConfig, getSchoolColorStyleBlock } from "@/lib/school-config";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const dynamic = "force-dynamic";

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
  const styleBlock = getSchoolColorStyleBlock();
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <style dangerouslySetInnerHTML={{ __html: styleBlock }} />
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
