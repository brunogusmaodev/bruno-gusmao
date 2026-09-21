import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    fetch(`${base}/api/projects`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    fetch(`${base}/api/posts`).then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: "https://brunogusmao.dev/", lastModified: new Date(), priority: 1 },
    { url: "https://brunogusmao.dev/projects", lastModified: new Date(), priority: 0.8 },
    { url: "https://brunogusmao.dev/blog", lastModified: new Date(), priority: 0.8 },
    { url: "https://brunogusmao.dev/contact", lastModified: new Date(), priority: 0.7 },
  ];

  const postRoutes = (posts ?? []).map((p: { slug: string; updatedAt?: string }) => ({
    url: `https://brunogusmao.dev/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
