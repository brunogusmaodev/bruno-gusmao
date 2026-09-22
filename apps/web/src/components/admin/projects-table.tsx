"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Eye, EyeOff, FolderKanban, Star, ExternalLink, Code2, GitBranch } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminBadge } from "./common-badge";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./use-toast";
import type { Badge } from "./posts-table";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export type Project = {
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
  visible: boolean;
  featured: boolean;
};

const EMPTY = {
  name: "", slug: "", summary: "", image: "", projectUrl: "", repoUrl: "",
  badge1Id: "", badge2Id: "", badge3Id: "", visible: true, featured: false,
};

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">{children}</label>;
}

export function ProjectsTable({ initialProjects, badges }: { initialProjects: Project[]; badges: Badge[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast, Toaster } = useToast();

  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));
  const set = (key: keyof typeof EMPTY, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (p: Project) => {
    setForm({
      name: p.name, slug: p.slug, summary: p.summary, image: p.image ?? "",
      projectUrl: p.projectUrl ?? "", repoUrl: p.repoUrl ?? "",
      badge1Id: p.badge1Id ?? "", badge2Id: p.badge2Id ?? "", badge3Id: p.badge3Id ?? "",
      visible: p.visible, featured: p.featured,
    });
    setEditId(p.id); setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const body = {
      ...form,
      image: form.image || null,
      projectUrl: form.projectUrl || null,
      repoUrl: form.repoUrl || null,
      badge1Id: form.badge1Id || null,
      badge2Id: form.badge2Id || null,
      badge3Id: form.badge3Id || null,
    };
    try {
      const url = editId ? `${API}/api/projects/${editId}` : `${API}/api/projects`;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (editId) setProjects((prev) => prev.map((p) => (p.id === editId ? data : p)));
      else setProjects((prev) => [...prev, Array.isArray(data) ? data[0] : data]);
      toast(editId ? "Projeto atualizado" : "Projeto criado");
      setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao salvar projeto", "error");
    } finally { setLoading(false); }
  };

  const toggleField = async (p: Project, field: "featured" | "visible") => {
    const body = { [field]: !p[field] };
    const res = await fetch(`${API}/api/projects/${p.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setProjects((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    toast(`${field === "featured" ? "Destaque" : "Visibilidade"} atualizado`);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/api/projects/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return toast("Erro ao deletar projeto", "error");
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast("Projeto deletado");
    setConfirmDelete(null);
  };

  const getBadges = (p: Project) =>
    [p.badge1Id, p.badge2Id, p.badge3Id].filter(Boolean).map((id) => badgeMap[id as string]).filter(Boolean);

  return (
    <>
      <Toaster />
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} projeto{projects.length !== 1 ? "s" : ""} cadastrado{projects.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate} className="gap-2 text-xs">
          <Plus className="size-3.5" /> Novo Projeto
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-card/80 hover:bg-card/80">
                <TableHead className="font-heading text-xs uppercase tracking-widest">Nome</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest hidden md:table-cell">Resumo</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest hidden lg:table-cell">Badges</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest hidden sm:table-cell">Destaque</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest">Visível</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <FolderKanban className="mx-auto size-8 opacity-20" />
                    <p className="mt-3 text-sm text-muted-foreground">Nenhum projeto cadastrado</p>
                    <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 text-xs">Criar o primeiro</Button>
                  </TableCell>
                </TableRow>
              )}
              {projects.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="size-3.5" /></a>}
                      {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand"><GitBranch className="size-3.5" /></a>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{p.slug}</span>
                  </TableCell>
                  <TableCell className="hidden max-w-48 truncate text-xs text-muted-foreground md:table-cell">{p.summary}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">{getBadges(p).map((b) => <AdminBadge key={b.id} {...b} />)}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <button onClick={() => toggleField(p, "featured")} className="rounded p-1 transition-colors hover:bg-brand/10">
                      <Star className={`size-4 ${p.featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.visible} onCheckedChange={() => toggleField(p, "visible")} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(p.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "EDITAR PROJETO" : "NOVO PROJETO"}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Nome</FieldLabel>
                <input className="input-admin" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} placeholder="Meu Projeto" />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Slug</FieldLabel>
                <input className="input-admin" value={form.slug} onChange={(e) => set("slug", toSlug(e.target.value))} placeholder="meu-projeto" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Resumo <span className="normal-case font-sans">(máx. 300 chars)</span></FieldLabel>
              <input className="input-admin" value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Descrição breve" maxLength={300} />
              <span className="text-right text-xs text-muted-foreground">{form.summary.length}/300</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>URL da Imagem</FieldLabel>
                <input className="input-admin" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>URL do Projeto</FieldLabel>
                <input className="input-admin" value={form.projectUrl} onChange={(e) => set("projectUrl", e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>URL do Repositório</FieldLabel>
              <input className="input-admin" value={form.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Badges <span className="normal-case font-sans">(até 3)</span></FieldLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(["badge1Id", "badge2Id", "badge3Id"] as const).map((key) => (
                  <select key={key} className="input-admin" value={form[key]} onChange={(e) => set(key, e.target.value)}>
                    <option value="">— nenhuma —</option>
                    {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                ))}
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[form.badge1Id, form.badge2Id, form.badge3Id].filter(Boolean).map((id) => {
                  const b = badgeMap[id as string];
                  return b ? <AdminBadge key={id} {...b} /> : null;
                })}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Visibilidade</FieldLabel>
              <div className="flex h-10 items-center gap-3 rounded-lg border border-border/50 bg-card/60 px-3">
                <Switch checked={form.visible} onCheckedChange={(v) => set("visible", v)} />
                <span className="text-sm text-muted-foreground">{form.visible ? "Visível ao público" : "Oculto ao público"}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || !form.name || !form.summary}>
              {loading ? "Salvando..." : editId ? "Salvar alterações" : "Criar projeto"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Deletar projeto?"
        description="Essa ação remove o projeto permanentemente. Não é possível desfazer."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Deletar"
      />
    </>
  );
}
