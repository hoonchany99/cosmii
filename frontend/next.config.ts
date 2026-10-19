import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apple fetches the app-site-association file itself, over https, with no
  // redirects, and will not read it unless it is served as JSON. The file has
  // no extension, so Next would otherwise hand it over as a download.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
