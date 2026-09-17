import { NextResponse, type NextRequest } from "next/server";

// The site is an introduction to the iPhone app: the landing page, the pages
// the app links to, and the API the app calls. The web app that used to live
// here (login, universe, onboarding, admin...) is closed, and its routes go to
// the landing page.
const OPEN_PATHS = ["/support", "/terms", "/privacy", "/opengraph-image", "/twitter-image", "/robots.txt", "/sitemap.xml"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)"],
};
