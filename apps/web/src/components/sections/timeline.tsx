import { GraduationCap, Scale, Code2, Building2 } from "lucide-react";

const timelineItems = [
  {
    year: "Atual",
    title: "Desenvolvedor Freelancer",
    description: "Frontend ao Backend — React, Next.js, Node.js, NestJS, TypeScript e Docker.",
    Icon: Code2,
  },
  {
    year: "2024",
    title: "Estagiário de IT",
    description: "Ministério Público do Trabalho — suporte técnico e HelpDesk.",
    Icon: Building2,
  },
  {
    year: "2022 – 2024",
    title: "Técnico em ADS",
    description: "Universidade Veiga de Almeida, Rio de Janeiro.",
    Icon: GraduationCap,
  },
  {
    year: "2007 – 2021",
    title: "Carreira jurídica",
    description: "Mais de uma década de atuação como advogado, conciliador e estagiário.",
    Icon: Scale,
  },
];

export function Timeline() {
  return (
    <ol className="relative border-l border-border pl-8">
      {timelineItems.map((item, index) => (
        <li key={index} className="relative pb-10 last:pb-0">
          <span className="absolute -left-[41px] flex size-4 items-center justify-center rounded-full border border-border bg-background">
            <span className="size-1.5 rounded-full bg-brand" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-brand">
              {item.year}
            </span>
            <div className="flex items-center gap-2">
              <item.Icon className="size-4 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
