import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, EB_Garamond, Gowun_Batang } from "next/font/google";
import { LanguageSync } from "@/components/language-sync";
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

const gowunBatang = Gowun_Batang({
  variable: "--font-ko-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosmii.app";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Cosmii — The easiest way to finish a book",
    template: "%s | Cosmii",
  },
  description:
    "Three minutes a day. Each chapter distilled into a short conversation. Tap through, quiz yourself, and actually finish the books you\u2019ve been meaning to read.",
  metadataBase: new URL(SITE_URL),
  applicationName: "Cosmii",
  keywords: [
    "AI",
    "book learning",
    "3-minute reading",
    "Cosmii",
    "book summary",
    "reading habit",
    "finish books",
    "bite-sized learning",
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
    title: "Cosmii — The easiest way to finish a book",
    description:
      "Three minutes a day. Tap through bite-sized lessons, quiz yourself, and actually finish the books you\u2019ve been meaning to read.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cosmii — The easiest way to finish a book",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cosmii — The easiest way to finish a book",
    description:
      "Three minutes a day. Tap through bite-sized lessons, quiz yourself, and actually finish the books you\u2019ve been meaning to read.",
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
        <meta name="apple-itunes-app" content="app-id=PLACEHOLDER_APP_ID, app-argument=cosmii://home" />
        {/* Preload Cosmii character WebP sprites to avoid pop-in */}
        <link rel="preload" as="image" type="image/webp" href="/cosmii/standing-mobile.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/talking-mobile.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/giggling-mobile.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/dancing-mobile.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/standing-desktop.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/talking-desktop.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/giggling-desktop.webp" />
        <link rel="preload" as="image" type="image/webp" href="/cosmii/dancing-desktop.webp" />
        <link rel="preload" as="image" type="image/png" href="/cosmii-constellation.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${gowunBatang.variable} antialiased`}
      >
        <LanguageSync />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
