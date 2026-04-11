import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, EB_Garamond, Nanum_Gothic } from "next/font/google";
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

function detectKorean(acceptLang: string | null): boolean {
  if (!acceptLang) return false;
  const first = acceptLang.split(",")[0].trim().toLowerCase();
  return first.startsWith("ko");
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const isKo = detectKorean(h.get("accept-language"));

  const title = isKo
    ? "Cosmii — 읽고 싶었던 책을 끝까지 읽는 가장 쉬운 방법"
    : "Cosmii — The easiest way to finish a book";
  const description = isKo
    ? "하루 3분, 짧은 레슨과 퀴즈로 읽고 싶었던 책을 가볍게 시작하세요. 끝까지 못 읽던 책도 조금씩 이해하게 돼요."
    : "Three minutes a day. Each chapter distilled into a short conversation. Tap through, quiz yourself, and actually finish the books you\u2019ve been meaning to read.";
  const locale = isKo ? "ko_KR" : "en_US";
  const keywords = isKo
    ? ["AI", "독서", "3분 독서", "Cosmii", "책 요약", "독서 습관", "책 완독", "대화형 학습"]
    : ["AI", "book learning", "3-minute reading", "Cosmii", "book summary", "reading habit", "finish books", "bite-sized learning"];

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
    alternates: {
      canonical: SITE_URL,
      languages: {
        "ko": SITE_URL,
        "en": SITE_URL,
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale,
      alternateLocale: isKo ? "en_US" : "ko_KR",
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
  const h = await headers();
  const isKoPage = detectKorean(h.get("accept-language"));
  const lang = isKoPage ? "ko" : "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cosmii",
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, iOS, Android",
    description: isKoPage
      ? "하루 3분, 짧은 레슨과 퀴즈로 읽고 싶었던 책을 가볍게 시작하세요."
      : "Three minutes a day. Tap through bite-sized lessons, quiz yourself, and actually finish the books you\u2019ve been meaning to read.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
      description: isKoPage ? "첫 책 무료" : "First book free",
    },
    creator: {
      "@type": "Organization",
      name: "Utopify",
    },
    inLanguage: ["ko", "en"],
  };

  return (
    <html lang={lang} className="dark">
      <head>
        <meta name="apple-itunes-app" content="app-id=PLACEHOLDER_APP_ID, app-argument=cosmii://home" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${nanumGothic.variable} antialiased`}
      >
        <LanguageSync />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
