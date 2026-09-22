import type { Metadata } from "next";
import { SectionHeader } from "@/components/sections/section-header";
import { ContentCard, type BadgeData } from "@/components/sections/content-card";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Portfólio de projetos de Bruno Gusmão — aplicações web fullstack com NestJS, Next.js e TypeScript.",
  openGraph: {
    title: "Projetos | Bruno Gusmão",
    description: "Projetos fullstack desenvolvidos por Bruno Gusmão.",
    url: "https://brunogusmao.dev/projects",
  },
};

const base = process.env.API_URL ?? "http://localhost:3002";

type ApiProject = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  image: string | null;
  projectUrl: string | null;
  repoUrl: string | null;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
};

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getData() {
  try {
    const [projects, badges] = await Promise.all([
      fetch(`${base}/api/projects`, { cache: "no-store" }).then<ApiProject[]>((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/badges`, { cache: "no-store" }).then<ApiBadge[]>((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    return { projects, badges };
  } catch {
    return { projects: [], badges: [] };
  }
}

function resolveBadges(project: ApiProject, badgeMap: Record<string, ApiBadge>): BadgeData[] {
  return [project.badge1Id, project.badge2Id, project.badge3Id]
    .filter(Boolean)
    .map((id) => badgeMap[id as string])
    .filter(Boolean)
    .map((b) => ({ id: b.id, name: b.name, bgColor: b.bgColor, textColor: b.textColor }));
}

export default async function ProjectsPage() {
  const { projects, badges } = await getData();
  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));
  const [featured, ...rest] = projects;

  return (
    <section className="section-padding">
      <div className="container-site">
        <SectionHeader
          overline="Portfólio"
          title="Projetos Selecionados"
          description="Aplicações e experimentos que mostram minha trajetória como desenvolvedor."
        />

        {featured && (
          <div className="mt-14">
            <ContentCard
              featured
              title={featured.name}
              description={featured.summary}
              image={featured.image}
              badges={resolveBadges(featured, badgeMap)}
              actions={[
                ...(featured.projectUrl
                  ? [{ label: "Ver Projeto", href: featured.projectUrl, external: true }]
                  : []),
                ...(featured.repoUrl
                  ? [{ label: "Repositório", href: featured.repoUrl, external: true }]
                  : []),
              ]}
            />
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <ContentCard
              key={project.id}
              title={project.name}
              description={project.summary}
              image={project.image}
              badges={resolveBadges(project, badgeMap)}
              actions={[
                ...(project.projectUrl
                  ? [{ label: "Ver Projeto", href: project.projectUrl, external: true }]
                  : []),
                ...(project.repoUrl
                  ? [{ label: "Repositório", href: project.repoUrl, external: true }]
                  : []),
              ]}
            />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="mt-20 rounded-2xl border border-border/50 bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">Nenhum projeto publicado ainda.</p>
          </div>
        )}
      </div>
    </section>
  );
}
