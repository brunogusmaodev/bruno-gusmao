"use client";

import Link from "next/link";
import { useEventPopup } from "@/hooks/use-event-popup";

export function EventButton() {
  const { enabled, eventName, eventBgColor, eventTextColor, loading } = useEventPopup();

  if (loading || !enabled) return null;

  return (
    <Link
      href="https://gameficacao.brunogusmao.dev"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all hover:opacity-90"
      style={{ backgroundColor: eventBgColor, color: eventTextColor }}
    >
      {eventName}
    </Link>
  );
}
