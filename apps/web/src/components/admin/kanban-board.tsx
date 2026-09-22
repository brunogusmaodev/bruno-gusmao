"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FolderKanban, FileText, Sparkles, Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./use-toast";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3002";

const FIXED_COLORS = { blog: "#3b82f6", project: "#8b5cf6" };

const COLUMNS = [
  { id: "backlog", label: "Backlog", color: "#6b7280", dot: "bg-muted-foreground/40" },
  { id: "todo", label: "A Fazer", color: "#3b82f6", dot: "bg-blue-400" },
  { id: "in-progress", label: "Em Andamento", color: "#f59e0b", dot: "bg-amber-400" },
  { id: "done", label: "Concluído", color: "#10b981", dot: "bg-emerald-400" },
];

const TASK_TYPE_META = [
  { value: "blog", label: "Blog", icon: FileText, color: FIXED_COLORS.blog },
  { value: "project", label: "Projeto", icon: FolderKanban, color: FIXED_COLORS.project },
  { value: "custom", label: "Livre", icon: Sparkles, color: null },
] as const;

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  taskType: "blog" | "project" | "custom";
  color: string | null;
  kanbanStatus: string;
};

type TaskForm = {
  title: string;
  description: string;
  taskType: "blog" | "project" | "custom";
  color: string;
};

const EMPTY_FORM: TaskForm = { title: "", description: "", taskType: "blog", color: "#e11d48" };

function getAccent(task: KanbanTask): string {
  if (task.taskType === "custom") return task.color ?? "#6b7280";
  return FIXED_COLORS[task.taskType as keyof typeof FIXED_COLORS] ?? "#6b7280";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">{children}</label>;
}

function TaskDialog({
  open, onOpenChange, initial, onSave, saving, mode,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; initial: TaskForm; onSave: (form: TaskForm) => void; saving: boolean; mode: "create" | "edit";
}) {
  const [form, setForm] = useState<TaskForm>(initial);
  useEffect(() => { if (open) setForm(initial); }, [open, initial]);
  const previewColor = form.taskType === "custom" ? form.color : FIXED_COLORS[form.taskType as keyof typeof FIXED_COLORS] ?? "#6b7280";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "NOVA TAREFA" : "EDITAR TAREFA"}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tipo</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {TASK_TYPE_META.map((t) => {
                const selected = form.taskType === t.value;
                const color = t.color ?? (selected ? form.color : "#6b7280");
                return (
                  <button
                    key={t.value}
                    onClick={() => setForm((f) => ({ ...f, taskType: t.value }))}
                    className={`flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 font-heading text-xs font-semibold uppercase tracking-wide transition-all ${
                      selected ? "border-2" : "border border-border text-muted-foreground"
                    }`}
                    style={selected ? { borderColor: color, color, backgroundColor: `${color}15` } : undefined}
                  >
                    <t.icon className="size-4" style={selected ? { color } : undefined} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          {form.taskType === "custom" && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Cor do card</FieldLabel>
              <div className="flex h-10 items-center gap-3 rounded-lg border border-border/50 bg-card/60 px-3">
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="size-7 cursor-pointer rounded border-0 bg-transparent p-0" />
                <span className="flex-1 font-mono text-sm text-muted-foreground">{form.color}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Título</FieldLabel>
            <input className="input-admin" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título da tarefa" autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Descrição <span className="normal-case font-sans">(opcional)</span></FieldLabel>
            <textarea className="input-admin min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detalhes da tarefa..." />
          </div>
          <div className="h-1 rounded-full transition-all" style={{ backgroundColor: previewColor }} />
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.title.trim()}>
            {saving ? "Salvando..." : mode === "create" ? "Criar tarefa" : "Salvar alterações"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

export function KanbanBoard({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const wsRef = useRef<WebSocket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState("backlog");
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KanbanTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast, Toaster } = useToast();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/kanban`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "card-moved") {
          const { id, to } = msg.data as { id: string; to: string };
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, kanbanStatus: to } : t)));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const to = destination.droppableId;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.kanbanStatus === to) return;
    setTasks((prev) => prev.map((t) => (t.id === draggableId ? { ...t, kanbanStatus: to } : t)));
    fetch(`${API}/api/kanban-tasks/${task.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kanbanStatus: to }),
    }).then((r) => { if (!r.ok) toast("Erro ao mover tarefa", "error"); });
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "move-card", data: { id: task.id, type: "task", to } }));
    }
  };

  const openCreate = (status: string) => { setCreateStatus(status); setCreateOpen(true); };
  const openEdit = (task: KanbanTask) => { setEditTarget(task); setEditOpen(true); };

  const handleCreate = async (form: TaskForm) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/kanban-tasks`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(), description: form.description.trim() || null,
          taskType: form.taskType, color: form.taskType === "custom" ? form.color : null, kanbanStatus: createStatus,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks((prev) => [...prev, Array.isArray(data) ? data[0] : data]);
      toast("Tarefa criada");
      setCreateOpen(false);
    } catch {
      toast("Erro ao criar tarefa", "error");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form: TaskForm) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/kanban-tasks/${editTarget.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(), description: form.description.trim() || null,
          taskType: form.taskType, color: form.taskType === "custom" ? form.color : null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === editTarget.id ? updated : t)));
      toast("Tarefa atualizada");
      setEditOpen(false);
    } catch {
      toast("Erro ao atualizar tarefa", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/api/kanban-tasks/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return toast("Erro ao deletar tarefa", "error");
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Tarefa deletada");
    setConfirmDelete(null);
  };

  const editInitial: TaskForm = editTarget
    ? { title: editTarget.title, description: editTarget.description ?? "", taskType: editTarget.taskType, color: editTarget.color ?? "#e11d48" }
    : EMPTY_FORM;

  return (
    <>
      <Toaster />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.kanbanStatus === col.id);
            return (
              <div key={col.id} className="flex w-60 shrink-0 flex-col gap-3 sm:w-72">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${col.dot}`} />
                    <h2 className="font-heading text-sm font-semibold uppercase tracking-wide" style={{ color: col.color }}>{col.label}</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border px-2 py-0.5 font-heading text-xs" style={{ color: col.color, borderColor: `${col.color}40`, backgroundColor: `${col.color}12` }}>{colTasks.length}</span>
                    <button onClick={() => openCreate(col.id)} className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand" title="Nova tarefa"><Plus className="size-3" /></button>
                  </div>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex min-h-32 flex-col gap-2 rounded-xl border p-2 transition-colors ${snapshot.isDraggingOver ? "border-brand/40 bg-brand/5" : "border-border/50 bg-card/30"}`}>
                      {colTasks.map((task, index) => {
                        const accent = getAccent(task);
                        const meta = TASK_TYPE_META.find((m) => m.value === task.taskType);
                        const Icon = meta?.icon ?? Sparkles;
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`group/card flex cursor-grab flex-col gap-2 rounded-lg border border-border/50 bg-card/80 p-3 transition-shadow active:cursor-grabbing ${snapshot.isDragging ? "shadow-lg shadow-brand/10" : ""}`}
                                style={{ ...provided.draggableProps.style, borderLeftColor: accent, borderLeftWidth: 2 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Icon className="size-3.5 shrink-0" style={{ color: accent }} />
                                    <span className="font-heading text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>{meta?.label ?? "Livre"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
                                    <button onClick={(e) => { e.stopPropagation(); openEdit(task); }} className="text-muted-foreground transition-colors hover:text-brand"><Pencil className="size-3" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(task.id); }} className="text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="size-3" /></button>
                                  </div>
                                </div>
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                {task.description && <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDialog open={createOpen} onOpenChange={setCreateOpen} initial={EMPTY_FORM} onSave={handleCreate} saving={saving} mode="create" />
      <TaskDialog open={editOpen} onOpenChange={setEditOpen} initial={editInitial} onSave={handleEdit} saving={saving} mode="edit" />

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
