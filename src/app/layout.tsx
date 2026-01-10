import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vagsocietyserbia.com"),
  title: {
    default: "VagSocietySerbia | Automobilski klub",
    template: "%s | VagSocietySerbia",
  },
  description:
    "Zvanicni sajt VagSocietySerbia - zajednica ljubitelja VAG kulture, dogadjaja i ekskluzivnih proizvoda.",
  keywords: [
    "VAG",
    "auto klub",
    "automobili",
    "Srbija",
    "VagSocietySerbia",
    "dogadjaji",
    "proizvodi",
  ],
  openGraph: {
    title: "VagSocietySerbia | Automobilski klub",
    description:
      "Pridruzi se VagSocietySerbia zajednici za dogadjaje, vrhunsku opremu i najbolje od VAG kulture.",
    url: "https://vagsocietyserbia.com",
    siteName: "VagSocietySerbia",
    locale: "sr_RS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
