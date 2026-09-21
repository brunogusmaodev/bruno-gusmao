import { Tag } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { BadgesTable, Badge } from "@/components/admin/badges-table";

const base = process.env.API_URL ?? "http://localhost:3001";

async function getBadges() {
  try {
    const res = await fetch(`${base}/api/badges`, { cache: "no-store" });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function BadgesAdminPage() {
  const badges: Badge[] = await getBadges();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Badges"
        description="Gerencie tags e tecnologias usadas nos cards."
        icon={Tag}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <BadgesTable initialBadges={badges} />
      </main>
    </div>
  );
}
