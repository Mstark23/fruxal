import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruxal — Financial Diagnostics for Canadian Small Business",
  description: "Fruxal finds invisible revenue leaks in Canadian businesses and recovers the money for you — no upfront cost, 12% of confirmed savings only.",
  keywords: "Canadian small business finance, financial diagnostic, business health score, SMB financial tools, Quebec business, free financial analysis",
  metadataBase: new URL("https://fruxal.ca"),
  openGraph: {
    title: "Fruxal — Free Financial Diagnostics for Canadian SMBs",
    description: "AI-powered financial diagnostics for Canadian small businesses. We find the leaks and recover the money — 12% of confirmed savings only.",
    url: "https://fruxal.ca",
    siteName: "Fruxal",
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fruxal — Free Financial Diagnostics for Canadian SMBs",
    description: "Financial leak detection and recovery for Canadian SMBs. No upfront cost.",
  },
  icons: {
    icon:  [{ url: "/icon.png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/icon.png",
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
