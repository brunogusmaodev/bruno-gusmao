import type { Metadata } from "next";
import { SectionHeader } from "@/components/sections/section-header";
import { ContentCard, type BadgeData } from "@/components/sections/content-card";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre desenvolvimento web, arquitetura de software e tecnologia escritos por Bruno Gusmão.",
  openGraph: {
    title: "Blog | Bruno Gusmão",
    description: "Artigos sobre desenvolvimento web, arquitetura de software e tecnologia.",
    url: "https://brunogusmao.dev/blog",
  },
};

const base = process.env.API_URL ?? "http://localhost:3001";

type ApiPost = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
  createdAt?: string;
};

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getData() {
  try {
    const [posts, badges] = await Promise.all([
      fetch(`${base}/api/posts`, { cache: "no-store" }).then<ApiPost[]>((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/badges`, { cache: "no-store" }).then<ApiBadge[]>((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    return { posts, badges };
  } catch {
    return { posts: [], badges: [] };
  }
}

function resolveBadges(post: ApiPost, badgeMap: Record<string, ApiBadge>): BadgeData[] {
  return [post.badge1Id, post.badge2Id, post.badge3Id]
    .filter(Boolean)
    .map((id) => badgeMap[id as string])
    .filter(Boolean)
    .map((b) => ({ id: b.id, name: b.name, bgColor: b.bgColor, textColor: b.textColor }));
}

export default async function BlogPage() {
  const { posts, badges } = await getData();
  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));

  return (
    <section className="section-padding">
      <div className="container-site">
        <SectionHeader
          overline="Blog"
          title="Artigos & Notas"
          description="Ideias, tutoriais e aprendizados sobre desenvolvimento e tecnologia."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ContentCard
              key={post.id}
              title={post.name}
              description={post.summary}
              image={post.imageUrl}
              href={`/blog/${post.slug}`}
              badges={resolveBadges(post, badgeMap)}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="mt-20 rounded-2xl border border-border/50 bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">Nenhum artigo publicado ainda.</p>
          </div>
        )}
      </div>
    </section>
  );
}
