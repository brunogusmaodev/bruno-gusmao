import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SectionHeader } from "@/components/sections/section-header";
import { BadgeData } from "@/components/sections/content-card";

const base = process.env.API_URL ?? "http://localhost:3002";

type ApiPost = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
  createdAt?: string;
  visible: boolean;
};

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getPost(slug: string): Promise<{ post: ApiPost; badges: BadgeData[] } | null> {
  try {
    const [postRes, badgesRes] = await Promise.all([
      fetch(`${base}/api/posts/${slug}`, { cache: "no-store" }),
      fetch(`${base}/api/badges`, { cache: "no-store" }),
    ]);
    if (!postRes.ok) return null;
    const post: ApiPost = await postRes.json();
    if (!post.visible) return null;
    const badges: ApiBadge[] = badgesRes.ok ? await badgesRes.json() : [];
    const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));
    const resolved = [post.badge1Id, post.badge2Id, post.badge3Id]
      .filter(Boolean)
      .map((id) => badgeMap[id as string])
      .filter(Boolean)
      .map((b) => ({ id: b.id, name: b.name, bgColor: b.bgColor, textColor: b.textColor }));
    return { post, badges: resolved };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return { title: "Artigo não encontrado | Bruno Gusmão" };
  const { post } = data;
  return {
    title: `${post.name} | Bruno Gusmão`,
    description: post.summary,
    openGraph: {
      title: `${post.name} | Bruno Gusmão`,
      description: post.summary,
      url: `https://brunogusmao.dev/blog/${post.slug}`,
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPost(slug);

  if (!data) {
    return (
      <section className="section-padding">
        <div className="container-site text-center">
          <h1 className="font-heading text-2xl font-bold">Artigo não encontrado</h1>
          <Link href="/blog" className="mt-4 inline-flex text-brand hover:text-brand">
            ← Voltar para o blog
          </Link>
        </div>
      </section>
    );
  }

  const { post, badges } = data;

  return (
    <article className="section-padding">
      <div className="container-site max-w-4xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Voltar ao blog
        </Link>

        <SectionHeader
          align="left"
          overline="Blog"
          title={post.name}
          description={post.summary}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {badges.map((badge) => (
            <span
              key={badge.id}
              className="rounded-sm px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider"
              style={{
                backgroundColor: badge.bgColor ?? "rgba(5, 115, 248, 0.1)",
                color: badge.textColor ?? "#0573f8",
              }}
            >
              {badge.name}
            </span>
          ))}
          {post.createdAt && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {post.imageUrl && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-lg border border-border">
            <Image
              src={post.imageUrl}
              alt={post.name}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          </div>
        )}

        <div className="prose mt-12 max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-card prose-img:rounded-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
