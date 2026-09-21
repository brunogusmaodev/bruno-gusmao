import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeData = {
  id: string;
  name: string;
  bgColor?: string | null;
  textColor?: string | null;
};

interface ContentCardProps {
  title: string;
  description: string;
  image?: string | null;
  badges?: BadgeData[];
  href?: string;
  meta?: string;
  featured?: boolean;
  actions?: { label: string; href: string; external?: boolean }[];
}

export function ContentCard({
  title,
  description,
  image,
  badges,
  href,
  meta,
  featured = false,
  actions,
}: ContentCardProps) {
  const Wrapper = href ? Link : "div";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-brand/40",
        featured ? "flex-col lg:flex-row lg:items-center" : "flex-col"
      )}
    >
      {image && (
        <div
          className={cn(
            "relative overflow-hidden",
            featured ? "aspect-video lg:w-1/2 lg:aspect-auto lg:min-h-[360px]" : "aspect-video"
          )}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: badge.bgColor ?? "rgba(5, 115, 248, 0.1)",
                  color: badge.textColor ?? "#0573f8",
                }}
              >
                {badge.name}
              </span>
            ))}
          </div>
        )}

        <Wrapper href={href ?? "#"} className={href ? "block" : undefined}>
          <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand">
            {title}
          </h3>
        </Wrapper>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-2">
          {meta && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {meta}
            </div>
          )}

          {actions && actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand/90"
                >
                  {action.label}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              ))}
            </div>
          ) : href ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors group-hover:text-brand">
              Ver mais
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
