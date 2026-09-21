import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { SectionHeader } from "@/components/sections/section-header";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com Bruno Gusmão — disponível para projetos freelance, colaborações e oportunidades.",
  openGraph: {
    title: "Contato | Bruno Gusmão",
    description: "Entre em contato com Bruno Gusmão para projetos freelance e colaborações.",
    url: "https://brunogusmao.dev/contact",
  },
};

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577 0-.286-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.838 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.815 1.103.815 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.218.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 1 1 2.063 2.065zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const contactLinks = [
  {
    Icon: Mail,
    label: "E-mail",
    value: "bruno.mulim.prog@gmail.com",
    href: "mailto:bruno.mulim.prog@gmail.com",
  },
  {
    Icon: GitHubIcon,
    label: "GitHub",
    value: "github.com/brunophelipegusmao",
    href: "https://github.com/brunophelipegusmao",
  },
  {
    Icon: LinkedInIcon,
    label: "LinkedIn",
    value: "linkedin.com/in/bruno-mulim",
    href: "https://linkedin.com/in/bruno-mulim",
  },
  {
    Icon: MapPin,
    label: "Localização",
    value: "Rio de Janeiro, Brasil",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <section className="section-padding">
      <div className="container-site">
        <SectionHeader
          overline="Contato"
          title="Vamos trabalhar juntos?"
          description="Tem um projeto em mente, uma dúvida ou quer trocar uma ideia? Me mande uma mensagem."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-8">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold">Informações de contato</h3>
              <ul className="flex flex-col gap-4">
                {contactLinks.map(({ Icon, label, value, href }) => (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-start gap-4 group"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-brand-dim text-muted-foreground transition-colors group-hover:border-brand/50 group-hover:text-brand">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <span className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                            {label}
                          </span>
                          <p className="text-sm font-medium text-foreground transition-colors group-hover:text-brand">
                            {value}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-brand-dim text-muted-foreground">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <span className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                            {label}
                          </span>
                          <p className="text-sm font-medium text-foreground">{value}</p>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-brand-dim p-6">
              <h3 className="font-heading text-lg font-semibold">Resposta rápida</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Costumo responder em até 24 horas em dias úteis. Para projetos urgentes, prefira o e-mail.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
