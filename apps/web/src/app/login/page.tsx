"use client";

import { useState } from "react";
import Image from "next/image";
import { signInWithGoogle } from "@/lib/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    signInWithGoogle();
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 sm:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="relative size-16 overflow-hidden rounded-md border border-border bg-card p-2">
          <Image
            src="/brand/logo-128.png"
            alt="Bruno Gusmão"
            fill
            className="object-contain p-1"
          />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Acesso ao Painel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com sua conta para gerenciar o conteúdo.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {loading ? "Redirecionando..." : "Entrar com Google"}
      </button>
    </div>
  );
}
