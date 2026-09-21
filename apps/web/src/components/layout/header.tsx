"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventButton } from "./event-button";

const navLinks = [
  { href: "/#sobre", label: "Sobre" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projetos" },
  { href: "/contact", label: "Contato" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-site flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-9 overflow-hidden rounded-md border border-border bg-card">
            <Image
              src="/brand/logo-128.png"
              alt="Bruno Gusmão"
              fill
              className="object-contain p-1"
              sizes="36px"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
              Bruno Gusmão
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Desenvolvedor Full Stack
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-brand-dim hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <EventButton />
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand/90"
          >
            Vamos conversar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-brand-dim md:hidden"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "container-site md:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-80 opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 border-t border-border pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-brand-dim hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="px-2 pt-1">
            <EventButton />
          </div>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="mt-1 rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Vamos conversar
          </Link>
        </nav>
      </div>
    </header>
  );
}
