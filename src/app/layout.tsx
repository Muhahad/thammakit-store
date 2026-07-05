import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SITE } from "@/config/site";
import { Analytics } from "@/components/analytics";
import "./globals.css";

// "Prompt" is a Google font with full Thai + Latin coverage.
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/** Default SEO metadata; pages override `title`/`description` as needed. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ร้านค้าออนไลน์`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  keywords: [
    "สังฆภัณฑ์",
    "ผ้าไตรจีวร",
    "ชุดสังฆทาน",
    "บาตรพระ",
    "เครื่องสักการะ",
    "โต๊ะหมู่บูชา",
    "ทำบุญ",
    "PromptPay",
    "จัดส่งทั่วไทย",
  ],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
