import { SidebarTrigger } from "@/components/ui/sidebar";
import { FolderKanban, FileText, Tag, CircleDot, ListTodo, Timer, CheckCircle2, Eye } from "lucide-react";
import { getSessionCookieHeader } from "@/lib/server-auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";

type WithVisibility = { visible: boolean };
type WithKanban = { kanbanStatus: string };

async function getStats() {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const authHeaders = await getSessionCookieHeader();

  try {
    const [projects, posts, badges, tasks] = await Promise.all([
      fetch(`${base}/api/projects/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/posts/all`, { cache: "no-store", headers: authHeaders }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/badges`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${base}/api/kanban-tasks`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    return { projects, posts, badges, tasks };
  } catch {
    return { projects: [], posts: [], badges: [], tasks: [] };
  }
}

export default async function DashboardPage() {
  const { projects, posts, badges, tasks } = await getStats();
  const visibleProjects = (projects as WithVisibility[]).filter((p) => p.visible).length;
  const visiblePosts = (posts as WithVisibility[]).filter((p) => p.visible).length;
  const count = (status: string) => (tasks as WithKanban[]).filter((t) => t.kanbanStatus === status).length;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Dashboard" action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            label="Projetos"
            icon={FolderKanban}
            total={projects.length}
            sub={`${visibleProjects} públicos`}
            subIcon={Eye}
            accent="#3b82f6"
          />
          <StatCard
            label="Posts"
            icon={FileText}
            total={posts.length}
            sub={`${visiblePosts} públicos`}
            subIcon={Eye}
            accent="#06b6d4"
          />
          <StatCard
            label="Badges"
            icon={Tag}
            total={badges.length}
            sub="criadas"
            accent="#8b5cf6"
          />
          <StatCard
            label="Tarefas"
            icon={CheckCircle2}
            total={tasks.length}
            sub="no kanban"
            accent="#10b981"
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 font-heading text-xs uppercase tracking-widest text-muted-foreground">
            Kanban
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Backlog" icon={CircleDot} total={count("backlog")} sub="tarefas" accent="#6b7280" />
            <StatCard label="A Fazer" icon={ListTodo} total={count("todo")} sub="tarefas" accent="#3b82f6" />
            <StatCard label="Em Andamento" icon={Timer} total={count("in-progress")} sub="tarefas" accent="#f59e0b" />
            <StatCard label="Concluído" icon={CheckCircle2} total={count("done")} sub="tarefas" accent="#10b981" />
          </div>
        </div>
      </main>
    </div>
  );
}
