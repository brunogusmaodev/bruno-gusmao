"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "./common-badge";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./use-toast";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export type Badge = {
  id: string;
  name: string;
  slug: string;
  bgColor: string;
  textColor: string;
  createdAt?: string;
};

const EMPTY = { name: "", slug: "", bgColor: "#1e293b", textColor: "#e2e8f0" };

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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-10 items-center gap-3 rounded-lg border border-border/50 bg-card/60 px-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="flex-1 font-mono text-sm text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

export function BadgesTable({ initialBadges }: { initialBadges: Badge[] }) {
  const [badges, setBadges] = useState(initialBadges);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast, Toaster } = useToast();

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (b: Badge) => {
    setForm({ name: b.name, slug: b.slug, bgColor: b.bgColor, textColor: b.textColor });
    setEditId(b.id); setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = editId ? `${API}/api/badges/${editId}` : `${API}/api/badges`;
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (editId) setBadges((prev) => prev.map((b) => (b.id === editId ? data : b)));
      else setBadges((prev) => [...prev, Array.isArray(data) ? data[0] : data]);
      toast(editId ? "Badge atualizada" : "Badge criada");
      setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao salvar badge", "error");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${API}/api/badges/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return toast("Erro ao deletar badge", "error");
    setBadges((prev) => prev.filter((b) => b.id !== id));
    toast("Badge deletada");
    setConfirmDelete(null);
  };

  return (
    <>
      <Toaster />
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} cadastrada{badges.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate} className="gap-2 text-xs">
          <Plus className="size-3.5" /> Nova Badge
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-card/80 hover:bg-card/80">
                <TableHead className="font-heading text-xs uppercase tracking-widest">Preview</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest">Nome</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest hidden sm:table-cell">Slug</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest hidden md:table-cell">Cores</TableHead>
                <TableHead className="font-heading text-xs uppercase tracking-widest text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <Tag className="mx-auto size-8 opacity-20" />
                    <p className="mt-3 text-sm text-muted-foreground">Nenhuma badge cadastrada</p>
                    <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 text-xs">Criar a primeira</Button>
                  </TableCell>
                </TableRow>
              )}
              {badges.map((b) => (
                <TableRow key={b.id} className="group">
                  <TableCell><AdminBadge name={b.name} bgColor={b.bgColor} textColor={b.textColor} /></TableCell>
                  <TableCell className="text-sm font-medium">{b.name}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{b.slug}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="block size-5 rounded-md border border-border" style={{ backgroundColor: b.bgColor }} />
                        <span className="block size-5 rounded-md border border-border" style={{ backgroundColor: b.textColor }} />
                      </div>
                      <span className="hidden font-mono text-xs text-muted-foreground lg:block">{b.bgColor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(b)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(b.id)}>
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
        <DialogPopup className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "EDITAR BADGE" : "NOVA BADGE"}</DialogTitle>
            <DialogCloseButton />
          </DialogHeader>
          <div className="flex flex-col gap-5 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Nome</FieldLabel>
                <input className="input-admin" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} placeholder="TypeScript" />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Slug</FieldLabel>
                <input className="input-admin" value={form.slug} onChange={(e) => set("slug", toSlug(e.target.value))} placeholder="typescript" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ColorField label="Cor de fundo" value={form.bgColor} onChange={(v) => set("bgColor", v)} />
              <ColorField label="Cor do texto" value={form.textColor} onChange={(v) => set("textColor", v)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Preview</FieldLabel>
              <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/60 p-6">
                <AdminBadge name={form.name || "preview"} bgColor={form.bgColor} textColor={form.textColor} />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || !form.name}>
              {loading ? "Salvando..." : editId ? "Salvar alterações" : "Criar badge"}
            </Button>
          </div>
        </DialogPopup>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Deletar badge?"
        description="Essa ação remove a badge permanentemente. Não é possível desfazer."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Deletar"
      />
    </>
  );
}
