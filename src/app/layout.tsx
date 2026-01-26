import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { SiteShell } from "@/app/SiteShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vagsocietyserbia.com"),
  icons: {
    icon: "/logo/vss_logo_black.png",
    shortcut: "/logo/vss_logo_black.png",
    apple: "/logo/vss_logo_black.png",
  },
  title: {
    default: "VagSocietySerbia | Automobilski klub",
    template: "%s | VagSocietySerbia",
  },
  description:
    "Zvanični sajt VagSocietySerbia - zajednica ljubitelja VAG kulture, događaja i ekskluzivnih proizvoda.",
  keywords: [
    "VAG",
    "auto klub",
    "automobili",
    "Srbija",
    "VagSocietySerbia",
    "događaji",
    "proizvodi",
  ],
  openGraph: {
    title: "VagSocietySerbia | Automobilski klub",
    description:
      "Pridruži se VagSocietySerbia zajednici za događaje, vrhunsku opremu i najbolje od VAG kulture.",
    url: "https://vagsocietyserbia.com",
    siteName: "VagSocietySerbia",
    locale: "sr_RS",
    type: "website",
  },
};

const themeScript = `
(() => {
  try {
    const storageKey = "vss-theme";
    const stored = localStorage.getItem(storageKey);
    const theme = stored === "light" || stored === "dark" ? stored : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("vss-language")?.value === "en" ? "en" : "sr";

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${inter.variable} antialiased dark:bg-slate-950 dark:text-slate-50`} suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
