import type { MetadataRoute } from "next";
import { getServiceClient } from "@/lib/supabase-server";

const PAGES = ["", "/support", "/terms", "/privacy"];

// Every book has a page, and those pages are the only ones that answer a
// search for a particular book, so they belong in the sitemap. They are read
// from the same table the pages themselves are drawn from, rather than a list
// kept by hand that would fall behind the shelf.
async function bookIds(): Promise<string[]> {
  try {
    const { data } = await getServiceClient().from("books").select("id");
    return ((data ?? []) as { id: string }[]).map((row) => row.id);
  } catch {
    // A sitemap missing its books is worth having; a build that fails because
    // the database was unreachable is not.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosmii.vercel.app";
  const lastModified = new Date();

  return [
    ...PAGES.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.5,
    })),
    ...(await bookIds()).map((id) => ({
      url: `${siteUrl}/book/${id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
