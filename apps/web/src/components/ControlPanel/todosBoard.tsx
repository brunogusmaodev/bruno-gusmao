"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Undo2,
  Users,
  User,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/use-toast";
import { usePushNotifications } from "@/lib/push";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-colors";
const labelClass = "font-heading text-xs uppercase tracking-widest text-muted-foreground";

const DAY_MS = 24 * 60 * 60 * 1000;
const CLOCK_TICK_MS = 30_000;

function subscribeClock(onTick: () => void) {
  const interval = setInterval(onTick, CLOCK_TICK_MS);
  return () => clearInterval(interval);
}

// Arredondado ao tick para o snapshot ser estável; null no SSR (fuso do servidor ≠ navegador).
function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => Math.floor(Date.now() / CLOCK_TICK_MS) * CLOCK_TICK_MS,
    () => null,
  );
}

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  shared: boolean;
  ownerId: string;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Tab = "mine" | "shared";

const pad = (n: number) => String(n).padStart(2, "0");

function toLocalInputs(iso: string | null) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

// "YYYY-MM-DDTHH:mm" sem fuso é interpretado como horário local do navegador.
function fromLocalInputs(date: string, time: string) {
  return date ? new Date(`${date}T${time || "09:00"}`).toISOString() : null;
}

const dueFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function sortPending(a: Todo, b: Todo) {
  if (a.dueAt && b.dueAt) return a.dueAt.localeCompare(b.dueAt);
  if (a.dueAt) return -1;
  if (b.dueAt) return 1;
  return a.createdAt.localeCompare(b.createdAt);
}

function DueChip({ dueAt, done, now }: { dueAt: string; done: boolean; now: number }) {
  const due = new Date(dueAt).getTime();
  const overdue = !done && due <= now;
  const soon = !done && !overdue && due - now <= DAY_MS;
  return (
    <span
      className={cn(
        "mt-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        done && "border-border/50 text-muted-foreground",
        overdue && "border-destructive/40 bg-destructive/10 text-destructive",
        soon && "border-amber-500/40 bg-amber-500/10 text-amber-500",
        !done && !overdue && !soon && "border-border text-muted-foreground",
      )}
    >
      <CalendarClock className="size-3" />
      {dueFormatter.format(due)}
      {overdue && " · atrasada"}
    </span>
  );
}

function TodoRow({
  todo,
  now,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  now: number | null;
  onToggle: (t: Todo) => void;
  onEdit: (t: Todo) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:bg-card/70">
      <Checkbox
        checked={todo.done}
        onCheckedChange={() => onToggle(todo)}
        className="mt-0.5"
        aria-label={todo.done ? "Marcar como pendente" : "Marcar como concluída"}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-snug wrap-break-word", todo.done && "text-muted-foreground line-through")}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 text-xs text-muted-foreground wrap-break-word">{todo.description}</p>
        )}
        {todo.dueAt && now !== null && <DueChip dueAt={todo.dueAt} done={todo.done} now={now} />}
      </div>
      <div className="flex items-center gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {todo.done && (
          <Button variant="ghost" size="icon-xs" onClick={() => onToggle(todo)} aria-label="Desmarcar concluída" title="Desmarcar">
            <Undo2 />
          </Button>
        )}
        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(todo)} aria-label="Editar tarefa" title="Editar">
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(todo.id)}
          className="hover:text-destructive"
          aria-label="Excluir tarefa"
          title="Excluir"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function TodoList({
  todos,
  now,
  empty,
  onToggle,
  onEdit,
  onDelete,
}: {
  todos: Todo[];
  now: number | null;
  empty: React.ReactNode;
  onToggle: (t: Todo) => void;
  onEdit: (t: Todo) => void;
  onDelete: (id: string) => void;
}) {
  const [showDone, setShowDone] = useState(true);
  const pending = useMemo(() => todos.filter((t) => !t.done).sort(sortPending), [todos]);
  const done = useMemo(
    () => todos.filter((t) => t.done).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [todos],
  );

  if (todos.length === 0) return <>{empty}</>;

  const row = (t: Todo) => (
    <TodoRow key={t.id} todo={t} now={now} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className={labelClass}>Pendentes ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Tudo em dia.</p>
        ) : (
          pending.map(row)
        )}
      </section>
      {done.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className={cn(labelClass, "flex items-center gap-1 self-start hover:text-foreground")}
            aria-expanded={showDone}
          >
            <ChevronDown className={cn("size-3.5 transition-transform", !showDone && "-rotate-90")} />
            Concluídas ({done.length})
          </button>
          {showDone && done.map(row)}
        </section>
      )}
    </div>
  );
}

function NotificationsButton({ onMessage }: { onMessage: (msg: string, type?: "success" | "error") => void }) {
  const { status, busy, enable, disable } = usePushNotifications();

  if (status === "loading" || status === "unsupported") return null;

  const handleClick = async () => {
    if (status === "needs-install") {
      return onMessage("No iPhone, adicione o painel à Tela de Início (Compartilhar → Adicionar à Tela de Início) para receber notificações.", "error");
    }
    if (status === "denied") {
      return onMessage("Notificações bloqueadas no navegador. Libere nas configurações do site.", "error");
    }
    try {
      if (status === "on") {
        await disable();
        onMessage("Notificações desativadas neste dispositivo");
      } else if (await enable()) {
        onMessage("Notificações ativadas neste dispositivo");
      }
    } catch {
      onMessage("Não foi possível ativar as notificações", "error");
    }
  };

  const Icon = status === "on" ? BellRing : status === "denied" ? BellOff : Bell;
  const label = status === "on" ? "Notificações ativas" : "Ativar notificações";

  return (
    <Button
      variant={status === "on" ? "secondary" : "outline"}
      onClick={handleClick}
      disabled={busy}
      className="gap-2 text-xs"
      title={label}
      aria-label={label}
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function TodosBoard({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [tab, setTab] = useState<Tab>("mine");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const now = useNow();
  const { toast, Toaster } = useToast();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/todos`);
    ws.onmessage = (event) => {
      try {
        const { event: type, data } = JSON.parse(event.data) as { event: string; data: Todo };
        setTodos((prev) => {
          if (type === "todo-created") {
            return prev.some((t) => t.id === data.id) ? prev : [...prev, data];
          }
          if (type === "todo-updated") {
            return prev.map((t) => (t.id === data.id ? data : t));
          }
          if (type === "todo-deleted") {
            return prev.filter((t) => t.id !== data.id);
          }
          return prev;
        });
      } catch {}
    };
    return () => ws.close();
  }, []);

  const mine = useMemo(() => todos.filter((t) => !t.shared), [todos]);
  const shared = useMemo(() => todos.filter((t) => t.shared), [todos]);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setOpen(true);
  };

  const openEdit = (todo: Todo) => {
    const { date, time } = toLocalInputs(todo.dueAt);
    setEditing(todo);
    setTitle(todo.title);
    setDescription(todo.description ?? "");
    setDueDate(date);
    setDueTime(time);
    setOpen(true);
  };

  const upsertLocal = (todo: Todo) =>
    setTodos((prev) => (prev.some((t) => t.id === todo.id) ? prev.map((t) => (t.id === todo.id ? todo : t)) : [...prev, todo]));

  const handleSave = async () => {
    if (!title.trim()) return;
    const dueAt = fromLocalInputs(dueDate, dueTime);
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`${API}/api/todos/${editing.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              description: description.trim(),
              ...(dueAt ? { dueAt } : editing.dueAt ? { clearDueAt: true } : {}),
            }),
          })
        : await fetch(`${API}/api/todos`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              description: description.trim() || null,
              shared: tab === "shared",
              dueAt,
            }),
          });
      if (!res.ok) throw new Error();
      upsertLocal(await res.json());
      toast(editing ? "Tarefa atualizada" : "Tarefa criada");
      setOpen(false);
    } catch {
      toast(editing ? "Erro ao atualizar tarefa" : "Erro ao criar tarefa", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const res = await fetch(`${API}/api/todos/${todo.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    if (!res.ok) return toast("Erro ao atualizar tarefa", "error");
    upsertLocal(await res.json());
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/api/todos/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return toast("Erro ao deletar tarefa", "error");
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast("Tarefa deletada");
    setConfirmDelete(null);
  };

  const listProps = { now, onToggle: handleToggle, onEdit: openEdit, onDelete: (id: string) => setConfirmDelete(id) };
  const isShared = editing ? editing.shared : tab === "shared";

  return (
    <>
      <Toaster />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTab value="mine" className="flex items-center gap-1.5">
              <User className="size-3.5" /> Meus
            </TabsTab>
            <TabsTab value="shared" className="flex items-center gap-1.5">
              <Users className="size-3.5" /> Compartilhados
            </TabsTab>
            <TabsIndicator />
          </TabsList>
          <div className="flex items-center gap-2">
            <NotificationsButton onMessage={toast} />
            <Button onClick={openCreate} className="gap-2 text-xs">
              <Plus className="size-3.5" /> Nova tarefa
            </Button>
          </div>
        </div>

        <TabsPanel value="mine" className="mt-4">
          <TodoList
            todos={mine}
            {...listProps}
            empty={
              <div className="py-16 text-center">
                <CheckSquare className="mx-auto size-8 opacity-20" />
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma tarefa privada</p>
              </div>
            }
          />
        </TabsPanel>

        <TabsPanel value="shared" className="mt-4">
          <TodoList
            todos={shared}
            {...listProps}
            empty={
              <div className="py-16 text-center">
                <Users className="mx-auto size-8 opacity-20" />
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma tarefa compartilhada</p>
              </div>
            }
          />
        </TabsPanel>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "EDITAR TAREFA" : isShared ? "NOVA TAREFA COMPARTILHADA" : "NOVA TAREFA"}
            </DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="todo-title" className={labelClass}>Título</label>
                <input
                  id="todo-title"
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O que precisa ser feito?"
                  maxLength={255}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="todo-description" className={labelClass}>
                  Descrição <span className="normal-case font-sans">(opcional)</span>
                </label>
                <textarea
                  id="todo-description"
                  className={`${inputClass} min-h-20 resize-none`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da tarefa..."
                  maxLength={1000}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>
                    Data e hora <span className="normal-case font-sans">(opcional)</span>
                  </span>
                  {(dueDate || dueTime) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate("");
                        setDueTime("");
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" /> Remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="date"
                    aria-label="Data"
                    className={inputClass}
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (e.target.value && !dueTime) setDueTime("09:00");
                    }}
                  />
                  <input
                    type="time"
                    aria-label="Hora"
                    className={inputClass}
                    value={dueTime}
                    disabled={!dueDate}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isShared
                    ? "Todos os usuários com notificações ativas serão avisados nesse horário."
                    : "Você será notificado nesse horário nos dispositivos com notificações ativas."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? "Salvando..." : editing ? "Salvar" : "Criar tarefa"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Deletar tarefa?"
        description="Essa ação remove a tarefa permanentemente."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Deletar"
      />
    </>
  );
}
