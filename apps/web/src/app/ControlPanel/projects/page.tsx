import { FolderKanban } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable, Project } from "@/components/admin/projects-table";
import { getSessionCookieHeader } from "@/lib/server-auth";
import type { Badge } from "@/components/admin/posts-table";

const base = process.env.API_URL ?? "http://localhost:3001";

async function getData() {
  const authHeaders = await getSessionCookieHeader();
  try {
    const [projects, badges] = await Promise.all([
      fetch(`${base}/api/projects/all`, { cache: "no-store", headers: authHeaders }).then<Project[]>((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/badges`, { cache: "no-store" }).then<Badge[]>((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    return { projects, badges };
  } catch {
    return { projects: [], badges: [] };
  }
}

export default async function ProjectsAdminPage() {
  const { projects, badges } = await getData();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Projetos"
        description="Gerencie projetos, links e visibilidade do portfólio."
        icon={FolderKanban}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <ProjectsTable initialProjects={projects} badges={badges} />
      </main>
    </div>
  );
}
