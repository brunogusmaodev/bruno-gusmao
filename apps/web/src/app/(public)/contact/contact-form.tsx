"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const subject = encodeURIComponent(`Contato de ${form.name} via site`);
    const body = encodeURIComponent(
      `Nome: ${form.name}\nE-mail: ${form.email}\n\nMensagem:\n${form.message}`
    );
    window.location.href = `mailto:bruno.mulim.prog@gmail.com?subject=${subject}&body=${body}`;
    setStatus("sent");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground"
        >
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Seu nome"
          required
          className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brand/50 focus:bg-card"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          required
          className="w-full rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brand/50 focus:bg-card"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="font-heading text-xs font-bold uppercase tracking-wide text-muted-foreground"
        >
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Como posso te ajudar?"
          required
          rows={6}
          className="w-full resize-none rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brand/50 focus:bg-card"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90 disabled:opacity-70"
      >
        <Send className="size-4" />
        {status === "sending" ? "Enviando..." : "Enviar mensagem"}
      </button>

      {status === "sent" && (
        <p className="text-center text-sm text-emerald-400">
          Obrigado! Você será redirecionado para seu cliente de e-mail.
        </p>
      )}
    </form>
  );
}
