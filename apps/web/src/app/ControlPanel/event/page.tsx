import { PartyPopper } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { EventSettingsForm, EventSettings } from "@/components/admin/event-settings-form";
import { getSessionCookieHeader } from "@/lib/server-auth";

const base = process.env.API_URL ?? "http://localhost:3002";

async function getSettings() {
  const authHeaders = await getSessionCookieHeader();
  try {
    const res = await fetch(`${base}/api/site-settings`, { cache: "no-store", headers: authHeaders });
    if (!res.ok) return null;
    return (await res.json()) as EventSettings;
  } catch {
    return null;
  }
}

export default async function EventAdminPage() {
  const initial = await getSettings();

  if (!initial) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader
          title="Evento"
          description="Configurações do popup de evento."
          icon={PartyPopper}
          action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center text-muted-foreground">
            Não foi possível carregar as configurações do evento.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Evento"
        description="Configure o popup e o botão de divulgação de eventos."
        icon={PartyPopper}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <EventSettingsForm initial={initial} />
      </main>
    </div>
  );
}
