"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "./use-toast";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export type EventSettings = {
  eventPopupEnabled: boolean;
  eventName: string;
  eventDescription: string | null;
  eventImageUrl: string | null;
  eventBgColor: string;
  eventTextColor: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">{children}</label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-10 items-center gap-3 rounded-lg border border-border/50 bg-card/60 px-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-7 cursor-pointer rounded border-0 bg-transparent p-0" />
        <span className="flex-1 font-mono text-sm text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

export function EventSettingsForm({ initial }: { initial: EventSettings }) {
  const [enabled, setEnabled] = useState(initial.eventPopupEnabled);
  const [form, setForm] = useState({
    eventName: initial.eventName,
    eventDescription: initial.eventDescription ?? "",
    eventImageUrl: initial.eventImageUrl ?? "",
    eventBgColor: initial.eventBgColor,
    eventTextColor: initial.eventTextColor,
  });
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, Toaster } = useToast();

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const toggle = async (value: boolean) => {
    setEnabled(value);
    setToggling(true);
    try {
      const res = await fetch(`${API}/api/site-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventPopupEnabled: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEnabled(updated.eventPopupEnabled);
        toast(`Popup ${updated.eventPopupEnabled ? "ativado" : "desativado"}`);
      } else throw new Error();
    } catch {
      setEnabled(!value);
      toast("Erro ao alterar popup", "error");
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/site-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventName: form.eventName || "Evento",
          eventDescription: form.eventDescription || null,
          eventImageUrl: form.eventImageUrl || null,
          eventBgColor: form.eventBgColor,
          eventTextColor: form.eventTextColor,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast("Configurações salvas");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-heading text-sm font-semibold uppercase tracking-widest">Popup do evento</span>
              <span className="max-w-md text-xs text-muted-foreground">
                Quando ativo, exibe um popup na home divulgando o evento e mostra o botão no header.
              </span>
            </div>
            <Switch checked={enabled} onCheckedChange={toggle} disabled={toggling} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nome do evento</FieldLabel>
            <input className="input-admin" value={form.eventName} onChange={(e) => set("eventName", e.target.value)} placeholder="Evento" />
            <span className="text-xs text-muted-foreground">Texto exibido no botão do header e no título do popup.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Texto do popup <span className="normal-case font-sans">(máx. 500 chars)</span></FieldLabel>
            <textarea className="input-admin min-h-[100px] resize-none" maxLength={500} value={form.eventDescription} onChange={(e) => set("eventDescription", e.target.value)} placeholder="Tem um evento rolando agora. Participe e concorra a prêmios!" />
            <span className="text-right text-xs text-muted-foreground">{form.eventDescription.length}/500</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>URL da imagem do popup</FieldLabel>
            <input className="input-admin" value={form.eventImageUrl} onChange={(e) => set("eventImageUrl", e.target.value)} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">Imagem vertical (proporção 2:3), ex.: 1024×1536 — é exibida em ~400–450px de largura no popup.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ColorField label="Cor de fundo" value={form.eventBgColor} onChange={(v) => set("eventBgColor", v)} />
            <ColorField label="Cor do texto" value={form.eventTextColor} onChange={(v) => set("eventTextColor", v)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Pré-visualização do botão</FieldLabel>
            <div className="flex h-16 items-center rounded-xl border border-border/50 bg-card/60 px-4">
              <span
                className="min-w-[120px] rounded-xl px-5 py-2 text-center font-heading text-sm font-semibold uppercase"
                style={{ backgroundColor: form.eventBgColor, color: form.eventTextColor }}
              >
                {form.eventName || "Evento"}
              </span>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
