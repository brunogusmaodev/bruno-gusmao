import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download, Mail } from "lucide-react";
import { SectionHeader } from "@/components/sections/section-header";
import { Timeline } from "@/components/sections/timeline";
import { SkillCloud } from "@/components/sections/skill-cloud";
import { ContentCard, type BadgeData } from "@/components/sections/content-card";

export const metadata: Metadata = {
  title: "Bruno Gusmão — Desenvolvedor Full Stack",
  description:
    "Portfolio de Bruno Gusmão — desenvolvedor full stack, do frontend ao backend.",
  openGraph: {
    title: "Bruno Gusmão — Desenvolvedor Full Stack",
    description: "Portfolio de Bruno Gusmão — desenvolvedor full stack.",
    url: "https://brunogusmao.dev",
  },
};

const base = process.env.API_URL ?? "http://localhost:3001";

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getFeaturedData() {
  try {
    const [projectsRes, postsRes, badgesRes] = await Promise.all([
      fetch(`${base}/api/projects`, { cache: "no-store" }),
      fetch(`${base}/api/posts`, { cache: "no-store" }),
      fetch(`${base}/api/badges`, { cache: "no-store" }),
    ]);
    const projects = projectsRes.ok ? await projectsRes.json() : [];
    const posts = postsRes.ok ? await postsRes.json() : [];
    const badges = badgesRes.ok ? await badgesRes.json() : [];
    return { projects, posts, badges };
  } catch {
    return { projects: [], posts: [], badges: [] };
  }
}

function resolveBadges(
  item: WithBadges,
  badgeMap: Record<string, ApiBadge>
): BadgeData[] {
  return [item.badge1Id, item.badge2Id, item.badge3Id]
    .filter(Boolean)
    .map((id) => badgeMap[id as string])
    .filter(Boolean)
    .map((b) => ({ id: b.id, name: b.name, bgColor: b.bgColor, textColor: b.textColor }));
}

type WithBadges = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  image?: string | null;
  imageUrl?: string | null;
  projectUrl?: string | null;
  repoUrl?: string | null;
  badge1Id?: string | null;
  badge2Id?: string | null;
  badge3Id?: string | null;
  createdAt?: string;
};

export default async function HomePage() {
  const { projects, posts, badges } = await getFeaturedData();
  const badgeMap = Object.fromEntries(badges.map((b: ApiBadge) => [b.id, b]));

  const featuredProject = projects[0];
  const featuredPost = posts[0];

  return (
    <>
      {/* Hero — case file */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24">
        <div className="container-site">
          <div className="border-t-2 border-foreground pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>In re: Bruno Gusmão</span>
              <span className="hidden sm:inline">Dossiê nº 2026-001</span>
              <span>Rio de Janeiro · BR</span>
            </div>

            <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              <div className="flex flex-col gap-6">
                <p className="eyebrow">Desenvolvedor Full Stack</p>
                <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                  Código limpo. Soluções completas.
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Construo aplicações web modernas do frontend ao backend com React,
                  Next.js, Node.js, NestJS, TypeScript e Docker.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90"
                  >
                    <Mail className="size-4" />
                    Fale comigo
                  </Link>
                  <a
                    href="/CV_Bruno-pt.pdf"
                    download
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40"
                  >
                    <Download className="size-4" />
                    Baixar CV
                  </a>
                </div>

                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-brand" />
                  Disponível para novos projetos
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-card">
                  <Image
                    src="/me.png"
                    alt="Foto de perfil de Bruno Gusmão"
                    width={600}
                    height={750}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Fig. 1 — Bruno Gusmão, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="sobre" className="section-padding">
        <div className="container-site">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader
                align="left"
                overline="Sobre mim"
                title="Desenvolvimento de ponta a ponta"
                description="Formação técnica sólida em desenvolvimento de software e experiência prática construída em projetos reais."
              />
              <div className="mt-8 flex flex-col gap-4 text-muted-foreground">
                <p>
                  Cursei Análise e Desenvolvimento de Sistemas e, desde então, atuo
                  como desenvolvedor freelancer — do frontend ao backend — com stack
                  moderna.
                </p>
                <p>
                  Trabalho com React, Next.js, Node.js, NestJS, TypeScript e Docker
                  para entregar aplicações completas: da interface ao banco de dados,
                  passando por APIs e infraestrutura.
                </p>
                <p>
                  Antes da tecnologia, construí uma carreira de mais de uma década em
                  outra área, o que me trouxe maturidade profissional, comunicação
                  clara e um olhar analítico para resolver problemas.
                </p>
              </div>
            </div>
            <div className="lg:pt-10">
              <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg border border-border bg-card lg:max-w-full">
                <Image
                  src="/me.png"
                  alt="Foto de perfil de Bruno Gusmão"
                  width={600}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="section-padding border-y border-border bg-card/40">
        <div className="container-site">
          <SectionHeader
            overline="Tecnologias"
            title="Stack de Trabalho"
            description="As principais ferramentas e tecnologias que uso para entregar soluções completas."
          />
          <div className="mt-12">
            <SkillCloud />
          </div>
        </div>
      </section>

      {/* Trajectory */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            overline="Trajetória"
            title="Onde estive e para onde vou"
            description="Uma carreira construída ao longo dos anos, com foco em tecnologia."
          />
          <div className="mx-auto mt-14 max-w-2xl">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Featured Project */}
      {featuredProject && (
        <section className="section-padding border-y border-border bg-card/40">
          <div className="container-site">
            <div className="flex items-end justify-between gap-4">
              <SectionHeader
                align="left"
                overline="Destaque"
                title="Projeto em destaque"
              />
              <Link
                href="/projects"
                className="hidden items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand sm:inline-flex"
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10">
              <ContentCard
                title={featuredProject.name}
                description={featuredProject.summary}
                image={featuredProject.image}
                featured
                badges={resolveBadges(featuredProject, badgeMap)}
                actions={[
                  ...(featuredProject.projectUrl
                    ? [{ label: "Ver Projeto", href: featuredProject.projectUrl, external: true }]
                    : []),
                  ...(featuredProject.repoUrl
                    ? [{ label: "Repositório", href: featuredProject.repoUrl, external: true }]
                    : []),
                ]}
              />
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {featuredPost && (
        <section className="section-padding">
          <div className="container-site">
            <div className="flex items-end justify-between gap-4">
              <SectionHeader
                align="left"
                overline="Blog"
                title="Últimos artigos"
              />
              <Link
                href="/blog"
                className="hidden items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand sm:inline-flex"
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post: WithBadges) => (
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding pt-0">
        <div className="container-site">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col items-start gap-6">
              <p className="eyebrow">Contato</p>
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Vamos construir algo juntos?
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Se você tem um projeto, uma ideia ou apenas quer trocar uma ideia sobre
                tecnologia, me mande uma mensagem.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90"
              >
                Entrar em contato
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
