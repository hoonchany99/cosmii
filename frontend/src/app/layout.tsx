import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, EB_Garamond, IBM_Plex_Sans_KR, Nanum_Gothic } from "next/font/google";
import localFont from "next/font/local";
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
//
// `preload: false` on the two Korean faces. next/font preloads every slice a
// family is cut into, and a Korean family is cut into hundreds: the book page
// was fetching 248 files and 2.5MB of them before a reader saw a word, which
// is seven times what the page's own text weighs. Without the preload a slice
// is fetched when a character in its range is actually drawn. Nothing about
// how any page is set changes - the same faces apply at the same sizes.
const plexKR = IBM_Plex_Sans_KR({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "600"],
  preload: false,
});

// MaruBuri, which is what a reader reads inside the app: lesson lines, book
// titles and descriptions, and Cosmii's own line. Self-hosted rather than
// pulled from a CDN at render time, and the same face the app embeds, so a
// book's page on the web is set the way the book's page in the app is.
// Naver's MaruBuri is OFL-1.1, which allows hosting the file on a site.
const maruBuri = localFont({
  src: [
    { path: "../../public/fonts/MaruBuri-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/MaruBuri-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-reading",
  display: "swap",
});

const nanumGothic = Nanum_Gothic({
  variable: "--font-ko-serif",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  preload: false,
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
  const title = "Cosmii — 고전을 읽는 가장 쉬운 방법";
  const description =
    "어렵던 고전, 쉽게 설명해 주니 읽혀요. 한 장은 3분. Cosmii가 소리 내어 읽어 주고 막히면 물어볼 수 있는 iPhone 앱.";
  const locale = "ko_KR";
  const keywords = ["Cosmii", "고전", "독서 앱", "책 읽기", "하루 한 장", "독서 습관", "오디오북", "AI 독서"];

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
    description: "어렵던 고전, 쉽게 설명해 주니 읽혀요. 한 장은 3분. Cosmii가 소리 내어 읽어 주고 막히면 물어볼 수 있는 iPhone 앱.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${plexKR.variable} ${nanumGothic.variable} ${maruBuri.variable} antialiased`}
      >
        <LanguageSync />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
