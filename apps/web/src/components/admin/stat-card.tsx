import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  total: number;
  sub: string;
  subIcon?: LucideIcon;
  accent: string;
}

export function StatCard({ label, icon: Icon, total, sub, subIcon: SubIcon, accent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 transition-colors hover:border-brand/30">
      <div
        className="absolute -right-4 -top-4 size-24 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          <Icon className="size-5" />
        </div>
        <span className="font-heading text-3xl font-bold tracking-tight text-foreground">{total}</span>
      </div>
      <div className="relative mt-4">
        <p className="font-heading text-sm font-semibold tracking-wide">{label}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          {SubIcon && <SubIcon className="size-3" />}
          {sub}
        </p>
      </div>
    </div>
  );
}
