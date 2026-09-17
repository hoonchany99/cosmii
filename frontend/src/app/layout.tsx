import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, EB_Garamond, IBM_Plex_Sans_KR, Nanum_Gothic } from "next/font/google";
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

// The app's own text face, for the pages a reader is sent to from inside it.
const plexKR = IBM_Plex_Sans_KR({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const nanumGothic = Nanum_Gothic({
  variable: "--font-ko-serif",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosmii.vercel.app";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Cosmii — 제목 대신 쪽지 한 줄로 만나는 고전";
  const description =
    "매주 봉인된 책 세 권이 도착해요. Cosmii의 쪽지만 보고 마음 가는 책을 뜯고, 하루 한 장씩 끝까지 읽는 iPhone 앱.";
  const locale = "ko_KR";
  const keywords = ["Cosmii", "고전", "독서 앱", "책 읽기", "하루 한 장", "독서 습관", "봉인된 책", "AI 독서"];

  return {
    title: { default: title, template: "%s | Cosmii" },
    description,
    metadataBase: new URL(SITE_URL),
    applicationName: "Cosmii",
    keywords,
    authors: [{ name: "Utopify" }],
    creator: "Utopify",
    publisher: "Utopify",
    formatDetection: { telephone: false },
    alternates: { canonical: SITE_URL },
    itunes: { appId: "6812843004" },
    openGraph: {
      type: "website",
      locale,
      url: SITE_URL,
      siteName: "Cosmii",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@utopify",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
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
      "msapplication-TileColor": "#060612",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Cosmii",
    url: SITE_URL,
    applicationCategory: "BookApplication",
    operatingSystem: "iOS",
    description: "매주 봉인된 책 세 권이 도착해요. Cosmii의 쪽지만 보고 마음 가는 책을 뜯고, 하루 한 장씩 끝까지 읽는 iPhone 앱.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    creator: { "@type": "Organization", name: "Utopify" },
    inLanguage: "ko",
  };

  return (
    <html lang="ko" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${plexKR.variable} ${nanumGothic.variable} antialiased`}
      >
        <LanguageSync />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
