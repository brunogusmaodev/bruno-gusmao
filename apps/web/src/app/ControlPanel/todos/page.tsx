import { ListTodo } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { TodosBoard, Todo } from "@/components/admin/todos-board";
import { getSessionCookieHeader } from "@/lib/server-auth";

const base = process.env.API_URL ?? "http://localhost:3002";

async function getTodos() {
  const authHeaders = await getSessionCookieHeader();
  try {
    const res = await fetch(`${base}/api/todos`, { cache: "no-store", headers: authHeaders });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function TodosPage() {
  const todos: Todo[] = await getTodos();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Todos"
        description="Suas tarefas privadas e as tarefas compartilhadas entre os usuários do painel."
        icon={ListTodo}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <TodosBoard initialTodos={todos} />
      </main>
    </div>
  );
}
