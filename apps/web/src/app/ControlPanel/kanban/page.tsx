import { Kanban } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { KanbanBoard, KanbanTask } from "@/components/admin/kanban-board";
import { getSessionCookieHeader } from "@/lib/server-auth";

const base = process.env.API_URL ?? "http://localhost:3001";

async function getTasks() {
  const authHeaders = await getSessionCookieHeader();
  try {
    const res = await fetch(`${base}/api/kanban-tasks`, { cache: "no-store", headers: authHeaders });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function KanbanPage() {
  const tasks: KanbanTask[] = await getTasks();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Kanban"
        description="Organize tarefas de projetos, posts e atividades livres."
        icon={Kanban}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
        <KanbanBoard initialTasks={tasks} />
      </main>
    </div>
  );
}
