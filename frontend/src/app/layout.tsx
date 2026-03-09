import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosmii.app";

export const metadata: Metadata = {
  title: {
    default: "Cosmii — AI Reading Companion",
    template: "%s | Cosmii",
  },
  description:
    "An AI reading companion that talks like someone who has actually read the books. Deep context understanding through knowledge graphs and multi-layer cognitive loops.",
  metadataBase: new URL(SITE_URL),
  applicationName: "Cosmii",
  keywords: [
    "AI",
    "reading companion",
    "book AI",
    "knowledge graph",
    "RAG",
    "Cosmii",
    "book assistant",
    "cognitive loop",
  ],
  authors: [{ name: "Utopify" }],
  creator: "Utopify",
  publisher: "Utopify",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Cosmii",
    title: "Cosmii — AI Reading Companion",
    description:
      "An AI reading companion that talks like someone who has actually read the books.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cosmii — AI Reading Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmii — AI Reading Companion",
    description:
      "An AI reading companion that talks like someone who has actually read the books.",
    images: ["/og-image.png"],
    creator: "@utopify",
  },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cosmii",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0f172a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
