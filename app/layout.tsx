import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruxal — Financial Operating System for Canadian Small Business",
  description: "Find what your business is losing. Fix it. Track your progress. Fruxal gives Canadian SMBs AI-powered financial diagnostics, leak detection, and a personalized action plan.",
  keywords: "Canadian small business finance, financial diagnostic, business health score, SMB financial tools, Quebec business",
  openGraph: {
    title: "Fruxal — Financial OS for Canadian SMBs",
    description: "AI-powered financial diagnostics for Canadian small businesses. Find leaks, fix them, track your recovery.",
    url: process.env.NEXTAUTH_URL || "https://fruxal.vercel.app",
    siteName: "Fruxal",
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fruxal — Financial OS for Canadian SMBs",
    description: "AI-powered financial diagnostics for Canadian small businesses.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
